const { prisma } = require("../prisma/prisma-client");
const { createNotification } = require("./notification-controller");

// Функция для извлечения хештегов из текста
const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) return [];
    return matches.map(tag => tag.substring(1).toLowerCase());
};

// Функция для извлечения упоминаний из текста
const extractMentions = async (text) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    if (!matches) return [];
    const usernames = matches.map(m => m.substring(1).toLowerCase());
    
    // Находим пользователей по имени или email
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { in: usernames, mode: 'insensitive' } },
                { email: { in: usernames, mode: 'insensitive' } }
            ]
        },
        select: { id: true }
    });
    
    return users.map(u => u.id);
};

const PostController = {
    createPost: async (req, res) => {
        const { content, privacy = 'public' } = req.body;
        const authorId = req.user.userId;
        const files = req.files || [];

        if (!content) {
            return res.status(400).json({
                error: 'Все поля обязательны'
            })
        }

        if (!['public', 'followers', 'private'].includes(privacy)) {
            return res.status(400).json({
                error: 'Неверный тип приватности'
            })
        }

        try {
            // Создаем пост
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId,
                    privacy
                }
            });

            // Сохраняем изображения
            if (files.length > 0) {
                const imageData = files.map(file => ({
                    url: `/${file.path}`,
                    postId: post.id
                }));
                await prisma.postImage.createMany({
                    data: imageData
                });
            }

            // Извлекаем и создаем хештеги
            const hashtags = extractHashtags(content);
            if (hashtags.length > 0) {
                for (const tagName of hashtags) {
                    let hashtag = await prisma.hashtag.findUnique({
                        where: { name: tagName }
                    });
                    
                    if (!hashtag) {
                        hashtag = await prisma.hashtag.create({
                            data: { name: tagName }
                        });
                    }

                    await prisma.postHashtag.create({
                        data: {
                            postId: post.id,
                            hashtagId: hashtag.id
                        }
                    });
                }
            }

            // Извлекаем и создаем упоминания
            const mentionedUserIds = await extractMentions(content);
            if (mentionedUserIds.length > 0) {
                const mentionData = mentionedUserIds.map(userId => ({
                    userId,
                    postId: post.id
                }));
                await prisma.mention.createMany({
                    data: mentionData
                });

                // Создаем уведомления для упомянутых пользователей
                for (const mentionedUserId of mentionedUserIds) {
                    await createNotification('mention', mentionedUserId, authorId, post.id);
                }
            }

            const postWithRelations = await prisma.post.findUnique({
                where: { id: post.id },
                include: {
                    images: true,
                    hashtags: {
                        include: {
                            hashtag: true
                        }
                    },
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            reposts: true
                        }
                    }
                }
            });

            res.json({
                ...postWithRelations,
                hashtags: postWithRelations.hashtags.map(pt => pt.hashtag.name)
            })
        } catch (error) {
            console.error('Create post error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        try {
            // Получаем ID пользователей, на которых подписан текущий пользователь
            const following = await prisma.follows.findMany({
                where: { followerId: userId },
                select: { followingId: true }
            });
            const followingIds = following.map(f => f.followingId);

            const [posts, total] = await Promise.all([
                prisma.post.findMany({
                    skip,
                    take: parseInt(limit),
                    where: {
                        OR: [
                            { privacy: 'public' },
                            { 
                                privacy: 'followers',
                                authorId: { in: [userId, ...followingIds] }
                            },
                            { 
                                privacy: 'private',
                                authorId: userId
                            }
                        ]
                    },
                    include: {
                        likes: true,
                        author: true,
                        comments: {
                            include: {
                                user: true
                            },
                            take: 5,
                            orderBy: {
                                createdAt: 'desc'
                            }
                        },
                        images: true,
                        originalPost: {
                            include: {
                                author: true,
                                images: true
                            }
                        },
                        hashtags: {
                            include: {
                                hashtag: true
                            }
                        },
                        bookmarks: {
                            where: { userId }
                        },
                        _count: {
                            select: {
                                comments: true,
                                reposts: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma.post.count({
                    where: {
                        OR: [
                            { privacy: 'public' },
                            { 
                                privacy: 'followers',
                                authorId: { in: [userId, ...followingIds] }
                            },
                            { 
                                privacy: 'private',
                                authorId: userId
                            }
                        ]
                    }
                })
            ]);

            const postWithInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                bookmarkedByUser: post.bookmarks.length > 0,
                hashtags: post.hashtags?.map(pt => pt.hashtag.name) || []
            }))

            res.json({
                posts: postWithInfo,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            })
        } catch (error) {
            console.error('Get all posts error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getPostById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    comments: {
                        include: {
                            user: true,
                            replies: {
                                include: {
                                    user: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    likes: true,
                    author: true,
                    images: true,
                    originalPost: {
                        include: {
                            author: true,
                            images: true
                        }
                    },
                    hashtags: {
                        include: {
                            hashtag: true
                        }
                    },
                    bookmarks: {
                        where: { userId }
                    },
                    _count: {
                        select: {
                            reposts: true
                        }
                    }
                }
            });

            if (!post) {
                return res.status(404).json({
                    error: 'Пост не найден'
                })
            }

            // Проверка доступа к приватному посту
            if (post.privacy === 'private' && post.authorId !== userId) {
                return res.status(403).json({
                    error: 'Нет доступа к этому посту'
                })
            }

            if (post.privacy === 'followers' && post.authorId !== userId) {
                const isFollowing = await prisma.follows.findFirst({
                    where: {
                        followerId: userId,
                        followingId: post.authorId
                    }
                });
                if (!isFollowing) {
                    return res.status(403).json({
                        error: 'Нет доступа к этому посту'
                    })
                }
            }

            const postWithInfo = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                bookmarkedByUser: post.bookmarks.length > 0,
                hashtags: post.hashtags?.map(pt => pt.hashtag.name) || []
            }

            res.json(postWithInfo)
        } catch (error) {
            console.error('Get Post by id error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    updatePost: async (req, res) => {
        const { id } = req.params;
        const { content, privacy } = req.body;
        const userId = req.user.userId;

        try {
            const post = await prisma.post.findUnique({ where: { id } });

            if (!post) {
                return res.status(404).json({
                    error: 'Пост не найден'
                })
            }

            if (post.authorId !== userId) {
                return res.status(403).json({
                    error: 'Нет доступа'
                })
            }

            // Удаляем старые связи с хештегами и упоминаниями
            await prisma.$transaction([
                prisma.postHashtag.deleteMany({ where: { postId: id } }),
                prisma.mention.deleteMany({ where: { postId: id } })
            ]);

            // Обновляем пост
            const updatedPost = await prisma.post.update({
                where: { id },
                data: {
                    content: content || undefined,
                    privacy: privacy || undefined
                }
            });

            // Создаем новые хештеги
            if (content) {
                const hashtags = extractHashtags(content);
                if (hashtags.length > 0) {
                    for (const tagName of hashtags) {
                        let hashtag = await prisma.hashtag.findUnique({
                            where: { name: tagName }
                        });
                        
                        if (!hashtag) {
                            hashtag = await prisma.hashtag.create({
                                data: { name: tagName }
                            });
                        }

                        await prisma.postHashtag.create({
                            data: {
                                postId: id,
                                hashtagId: hashtag.id
                            }
                        });
                    }
                }

                // Создаем новые упоминания
                const mentionedUserIds = await extractMentions(content);
                if (mentionedUserIds.length > 0) {
                    const mentionData = mentionedUserIds.map(uid => ({
                        userId: uid,
                        postId: id
                    }));
                    await prisma.mention.createMany({
                        data: mentionData
                    });

                    for (const mentionedUserId of mentionedUserIds) {
                        await createNotification('mention', mentionedUserId, userId, id);
                    }
                }
            }

            const postWithRelations = await prisma.post.findUnique({
                where: { id },
                include: {
                    images: true,
                    hashtags: {
                        include: {
                            hashtag: true
                        }
                    },
                    author: true
                }
            });

            res.json({
                ...postWithRelations,
                hashtags: postWithRelations.hashtags.map(pt => pt.hashtag.name)
            })
        } catch (error) {
            console.error('Update post error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;
        
        const post = await prisma.post.findUnique({ where: { id } });

        if (!post) {
            return res.status(404).json({
                error: 'Пост не найден'
            })
        }

        if (post.authorId !== req.user.userId) {
            return res.status(403).json({
                error: 'Нет доступа'
            })
        }

        try {
            const transaction = await prisma.$transaction([
                prisma.comment.deleteMany({ where: { postId: id } }),
                prisma.like.deleteMany({ where: { postId: id } }),
                prisma.bookmark.deleteMany({ where: { postId: id } }),
                prisma.repost.deleteMany({ where: { postId: id } }),
                prisma.postHashtag.deleteMany({ where: { postId: id } }),
                prisma.mention.deleteMany({ where: { postId: id } }),
                prisma.postImage.deleteMany({ where: { postId: id } }),
                prisma.post.delete({ where: { id } })
            ])

            res.json(transaction)
        } catch (error) {
            console.error('Delete post error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

module.exports = PostController