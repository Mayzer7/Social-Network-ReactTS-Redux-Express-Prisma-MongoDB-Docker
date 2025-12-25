const { prisma } = require("../prisma/prisma-client");
const { createNotification } = require("./notification-controller");

const RepostController = {
    createRepost: async (req, res) => {
        const { postId, comment } = req.body; // comment - опциональный комментарий к репосту
        const userId = req.user.userId;

        if (!postId) {
            return res.status(400).json({
                error: 'ID поста обязателен'
            })
        }

        try {
            // Проверяем существование поста
            const originalPost = await prisma.post.findUnique({
                where: { id: postId },
                include: { author: true }
            });

            if (!originalPost) {
                return res.status(404).json({
                    error: 'Пост не найден'
                })
            }

            // Проверяем, не репостил ли уже пользователь этот пост
            const existingRepost = await prisma.repost.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });

            if (existingRepost) {
                return res.status(400).json({
                    error: 'Вы уже репостили этот пост'
                })
            }

            // Создаем репост
            const repost = await prisma.repost.create({
                data: {
                    userId,
                    postId
                }
            });

            // Создаем новый пост-репост
            const repostPost = await prisma.post.create({
                data: {
                    content: comment || '',
                    authorId: userId,
                    originalPostId: postId,
                    privacy: 'public'
                },
                include: {
                    author: true,
                    originalPost: {
                        include: {
                            author: true,
                            images: true
                        }
                    }
                }
            });

            // Увеличиваем счетчик репостов
            await prisma.post.update({
                where: { id: postId },
                data: {
                    repostsCount: {
                        increment: 1
                    }
                }
            });

            // Создаем уведомление для автора оригинального поста
            await createNotification('repost', originalPost.authorId, userId, postId);

            res.json(repostPost)
        } catch (error) {
            console.error('Create repost error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    removeRepost: async (req, res) => {
        const { id } = req.params; // ID оригинального поста
        const userId = req.user.userId;

        try {
            const repost = await prisma.repost.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId: id
                    }
                }
            });

            if (!repost) {
                return res.status(404).json({
                    error: 'Репост не найден'
                })
            }

            // Удаляем пост-репост
            await prisma.post.deleteMany({
                where: {
                    authorId: userId,
                    originalPostId: id
                }
            });

            // Удаляем запись о репосте
            await prisma.repost.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId: id
                    }
                }
            });

            // Уменьшаем счетчик репостов
            await prisma.post.update({
                where: { id },
                data: {
                    repostsCount: {
                        decrement: 1
                    }
                }
            });

            res.json({ success: true })
        } catch (error) {
            console.error('Remove repost error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getReposts: async (req, res) => {
        const { postId } = req.params;

        try {
            const reposts = await prisma.repost.findMany({
                where: { postId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json(reposts)
        } catch (error) {
            console.error('Get reposts error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

module.exports = RepostController

