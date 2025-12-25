const { prisma } = require("../prisma/prisma-client");

const SearchController = {
    searchUsers: async (req, res) => {
        const { q } = req.query;
        const userId = req.user.userId;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Поисковый запрос обязателен'
            })
        }

        try {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { email: { contains: q, mode: 'insensitive' } }
                    ],
                    id: { not: userId }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    bio: true,
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                            posts: true
                        }
                    }
                },
                take: 20
            });

            const userIds = users.map(u => u.id);
            const follows = await prisma.follows.findMany({
                where: {
                    followerId: userId,
                    followingId: { in: userIds }
                }
            });

            const followsMap = new Map(follows.map(f => [f.followingId, true]));

            const usersWithFollowStatus = users.map(user => ({
                ...user,
                isFollowing: followsMap.has(user.id)
            }));

            res.json(usersWithFollowStatus)
        } catch (error) {
            console.error('Search users error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    searchPosts: async (req, res) => {
        const { q } = req.query;
        const userId = req.user.userId;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Поисковый запрос обязателен'
            })
        }

        try {
            const posts = await prisma.post.findMany({
                where: {
                    content: { contains: q, mode: 'insensitive' },
                    privacy: { in: ['public', 'followers'] } // Только публичные или для подписчиков
                },
                include: {
                    likes: true,
                    author: true,
                    comments: true,
                    images: true,
                    originalPost: {
                        include: {
                            author: true
                        }
                    },
                    hashtags: {
                        include: {
                            hashtag: true
                        }
                    },
                    bookmarks: {
                        where: { userId }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 20
            });

            const postsWithInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                bookmarkedByUser: post.bookmarks.length > 0,
                hashtags: post.hashtags?.map(pt => pt.hashtag.name) || []
            }));

            res.json(postsWithInfo)
        } catch (error) {
            console.error('Search posts error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    searchHashtags: async (req, res) => {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                error: 'Поисковый запрос обязателен'
            })
        }

        try {
            const hashtags = await prisma.hashtag.findMany({
                where: {
                    name: { contains: q.toLowerCase(), mode: 'insensitive' }
                },
                include: {
                    _count: {
                        select: { postTags: true }
                    }
                },
                orderBy: {
                    postTags: {
                        _count: 'desc'
                    }
                },
                take: 20
            });

            res.json(hashtags)
        } catch (error) {
            console.error('Search hashtags error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getPostsByHashtag: async (req, res) => {
        const { hashtag } = req.params;
        const userId = req.user.userId;

        try {
            const hashtagRecord = await prisma.hashtag.findUnique({
                where: { name: hashtag.toLowerCase() }
            });

            if (!hashtagRecord) {
                return res.json([])
            }

            const postHashtags = await prisma.postHashtag.findMany({
                where: { hashtagId: hashtagRecord.id },
                include: {
                    post: {
                        include: {
                            likes: true,
                            author: true,
                            comments: true,
                            images: true,
                            originalPost: {
                                include: {
                                    author: true
                                }
                            },
                            hashtags: {
                                include: {
                                    hashtag: true
                                }
                            },
                            bookmarks: {
                                where: { userId }
                            }
                        }
                    }
                },
                orderBy: {
                    post: {
                        createdAt: 'desc'
                    }
                },
                take: 20
            });

            const posts = postHashtags.map(ph => ph.post);
            const postsWithInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId),
                bookmarkedByUser: post.bookmarks.length > 0,
                hashtags: post.hashtags?.map(pt => pt.hashtag.name) || []
            }));

            res.json(postsWithInfo)
        } catch (error) {
            console.error('Get posts by hashtag error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

module.exports = SearchController

