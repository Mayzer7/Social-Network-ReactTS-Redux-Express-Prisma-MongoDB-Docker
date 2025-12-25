const { prisma } = require("../prisma/prisma-client");
const { createNotification } = require("./notification-controller");

// Функция для извлечения упоминаний из текста
const extractMentions = async (text) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    if (!matches) return [];
    const usernames = matches.map(m => m.substring(1).toLowerCase());
    
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

const CommentController = {
    createComment: async (req, res) => {
        const { postId, content, parentId } = req.body; // parentId - для ответов на комментарии
        const userId = req.user.userId;

        if (!postId || !content) {
            return res.status(400).json({
                error: 'Все поля обязательны'
            })
        }

        try {
            // Проверяем существование поста
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { authorId: true }
            });

            if (!post) {
                return res.status(404).json({
                    error: 'Пост не найден'
                })
            }

            // Если это ответ на комментарий, проверяем существование родительского комментария
            if (parentId) {
                const parentComment = await prisma.comment.findUnique({
                    where: { id: parentId }
                });

                if (!parentComment) {
                    return res.status(404).json({
                        error: 'Комментарий не найден'
                    })
                }
            }

            const comment = await prisma.comment.create({
                data: {
                    postId,
                    userId,
                    content,
                    parentId: parentId || null
                },
                include: {
                    user: true,
                    parent: parentId ? {
                        include: {
                            user: true
                        }
                    } : false
                }
            });

            // Извлекаем и создаем упоминания
            const mentionedUserIds = await extractMentions(content);
            if (mentionedUserIds.length > 0) {
                const mentionData = mentionedUserIds.map(uid => ({
                    userId: uid,
                    commentId: comment.id,
                    postId: postId
                }));
                await prisma.mention.createMany({
                    data: mentionData
                });

                // Создаем уведомления для упомянутых пользователей
                for (const mentionedUserId of mentionedUserIds) {
                    await createNotification('mention', mentionedUserId, userId, postId, comment.id);
                }
            }

            // Создаем уведомление для автора поста
            await createNotification('comment', post.authorId, userId, postId, comment.id);

            // Если это ответ на комментарий, создаем уведомление для автора родительского комментария
            if (parentId) {
                const parentComment = await prisma.comment.findUnique({
                    where: { id: parentId },
                    select: { userId: true }
                });
                if (parentComment && parentComment.userId !== userId) {
                    await createNotification('reply', parentComment.userId, userId, postId, comment.id);
                }
            }

            res.json(comment)

        } catch (error) {
            console.error('Create comment error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    deleteComment: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const comment = await prisma.comment.findUnique({ where: { id } });

            if (!comment) {
                return res.status(404).json({
                    error: 'Комментарии не найден'
                })
            }

            if (comment.userId !== userId) {
                return res.status(403).json({
                    error: 'Нет доступа'
                })
            }

            await prisma.comment.delete({ where: { id } });

            res.json(comment)

        } catch (error) {
            console.error('Delete comment error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    updateComment: async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        if (!content) {
            return res.status(400).json({
                error: 'Все поля обязательны'
            })
        }

        try {
            const comment = await prisma.comment.findUnique({ 
                where: { id },
                include: { post: { select: { id: true } } }
            });

            if (!comment) {
                return res.status(404).json({
                    error: 'Комментарий не найден'
                })
            }

            if (comment.userId !== userId) {
                return res.status(403).json({
                    error: 'Нет доступа'
                })
            }

            // Удаляем старые упоминания
            await prisma.mention.deleteMany({
                where: { commentId: id }
            });

            const updatedComment = await prisma.comment.update({
                where: { id },
                data: { content },
                include: {
                    user: true,
                    replies: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            // Создаем новые упоминания
            const mentionedUserIds = await extractMentions(content);
            if (mentionedUserIds.length > 0) {
                const mentionData = mentionedUserIds.map(uid => ({
                    userId: uid,
                    commentId: id,
                    postId: comment.post.id
                }));
                await prisma.mention.createMany({
                    data: mentionData
                });

                for (const mentionedUserId of mentionedUserIds) {
                    await createNotification('mention', mentionedUserId, userId, comment.post.id, id);
                }
            }

            res.json(updatedComment)
        } catch (error) {
            console.error('Update comment error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getCommentReplies: async (req, res) => {
        const { id } = req.params;

        try {
            const replies = await prisma.comment.findMany({
                where: { parentId: id },
                include: {
                    user: true,
                    replies: {
                        include: {
                            user: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            res.json(replies)
        } catch (error) {
            console.error('Get comment replies error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

module.exports = CommentController