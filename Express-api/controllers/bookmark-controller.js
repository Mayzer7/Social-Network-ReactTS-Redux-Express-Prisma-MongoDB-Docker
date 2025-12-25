const { prisma } = require("../prisma/prisma-client");

const BookmarkController = {
    addBookmark: async (req, res) => {
        const { postId } = req.body;
        const userId = req.user.userId;

        if (!postId) {
            return res.status(400).json({
                error: 'ID поста обязателен'
            })
        }

        try {
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post) {
                return res.status(404).json({
                    error: 'Пост не найден'
                })
            }

            const existingBookmark = await prisma.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });

            if (existingBookmark) {
                return res.status(400).json({
                    error: 'Закладка уже добавлена'
                })
            }

            const bookmark = await prisma.bookmark.create({
                data: {
                    userId,
                    postId
                },
                include: {
                    post: {
                        include: {
                            author: true,
                            images: true,
                            _count: {
                                select: {
                                    likes: true,
                                    comments: true
                                }
                            }
                        }
                    }
                }
            });

            res.json(bookmark)
        } catch (error) {
            console.error('Add bookmark error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    removeBookmark: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const bookmark = await prisma.bookmark.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId: id
                    }
                }
            });

            if (!bookmark) {
                return res.status(404).json({
                    error: 'Закладка не найдена'
                })
            }

            await prisma.bookmark.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId: id
                    }
                }
            });

            res.json({ success: true })
        } catch (error) {
            console.error('Remove bookmark error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getBookmarks: async (req, res) => {
        const userId = req.user.userId;

        try {
            const bookmarks = await prisma.bookmark.findMany({
                where: { userId },
                include: {
                    post: {
                        include: {
                            likes: true,
                            author: true,
                            comments: true,
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
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const posts = bookmarks.map(b => b.post);
            const postsWithInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                bookmarkedByUser: true,
                hashtags: post.hashtags?.map(pt => pt.hashtag.name) || []
            }));

            res.json(postsWithInfo)
        } catch (error) {
            console.error('Get bookmarks error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

module.exports = BookmarkController

