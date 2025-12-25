const { prisma } = require("../prisma/prisma-client");

const NotificationController = {
    getNotifications: async (req, res) => {
        const userId = req.user.userId;
        const { unreadOnly = false, limit = 50 } = req.query;

        try {
            const where = {
                userId,
                ...(unreadOnly === 'true' && { read: false })
            };

            const notifications = await prisma.notification.findMany({
                where,
                include: {
                    // Можно добавить информацию о пользователе, который создал уведомление
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: parseInt(limit)
            });

            res.json(notifications)
        } catch (error) {
            console.error('Get notifications error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    markAsRead: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            const notification = await prisma.notification.findUnique({
                where: { id }
            });

            if (!notification) {
                return res.status(404).json({
                    error: 'Уведомление не найдено'
                })
            }

            if (notification.userId !== userId) {
                return res.status(403).json({
                    error: 'Нет доступа'
                })
            }

            const updated = await prisma.notification.update({
                where: { id },
                data: { read: true }
            });

            res.json(updated)
        } catch (error) {
            console.error('Mark notification as read error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    markAllAsRead: async (req, res) => {
        const userId = req.user.userId;

        try {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    read: false
                },
                data: {
                    read: true
                }
            });

            res.json({ success: true })
        } catch (error) {
            console.error('Mark all notifications as read error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    getUnreadCount: async (req, res) => {
        const userId = req.user.userId;

        try {
            const count = await prisma.notification.count({
                where: {
                    userId,
                    read: false
                }
            });

            res.json({ count })
        } catch (error) {
            console.error('Get unread count error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
};

// Вспомогательная функция для создания уведомлений
const createNotification = async (type, userId, fromUserId, postId = null, commentId = null) => {
    try {
        // Не создаем уведомление, если пользователь делает действие со своим контентом
        if (userId === fromUserId) return;

        await prisma.notification.create({
            data: {
                type,
                userId,
                fromUserId,
                postId,
                commentId
            }
        });
    } catch (error) {
        console.error('Create notification error', error);
    }
};

module.exports = { NotificationController, createNotification }

