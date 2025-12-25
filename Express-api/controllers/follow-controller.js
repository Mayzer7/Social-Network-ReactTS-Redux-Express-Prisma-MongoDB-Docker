const { prisma } = require("../prisma/prisma-client");
const { createNotification } = require("./notification-controller");

const FollowController = {
    followUser: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;

        if (followingId === userId) {
            return res.status(500).json({
                error: 'Вы не можете подписаться на себя'
            })
        }

        try {
            const existingFollow = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })

            if (existingFollow) {
                return res.status(400).json({
                    error: 'Вы уже подписаны на этого пользователя'
                })
            }

            await prisma.follows.create({
                data: {
                    followerId: userId,
                    followingId: followingId
                }
            });

            // Создаем уведомление
            await createNotification('follow', followingId, userId);

            res.status(201).json({ message: 'Вы подписались' })
        } catch (error) {
            console.error('Follow error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    },
    unfollowUser: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;

        try {
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerId: userId },
                        { followingId }
                    ]
                }
            })

            if (!follows) {
                return res.status(404).json({
                    error: 'Вы не подписаны на этого пользователя'
                })
            }

            await prisma.follows.deleteMany({
                where: { id: follows.id }
            })

            res.status(201).json({ message: 'Вы отписались' })
        } catch (error) {
            console.error('Unfollow error', error);
            res.status(500).json({
                error: 'Internal server error'
            })
        }
    }
}

module.exports = FollowController;