const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UserController, PostController, CommentController, LikeController, FollowController, RepostController, BookmarkController, SearchController, NotificationController } = require('../controllers');
const authenticateToken = require('../middleware/auth');

const uploadDestination = 'uploads'

// Показываем где хранить файлы
const storage = multer.diskStorage({
    destination: uploadDestination,
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Роуты пользователя
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authenticateToken, UserController.current)
router.get('/users/:id', authenticateToken, UserController.getUserById)
router.put('/users/:id', authenticateToken, uploads.single('avatar'), UserController.updateUser)

// Роуты постов
router.post('/posts', authenticateToken, uploads.array('images', 5), PostController.createPost)
router.get('/posts', authenticateToken, PostController.getAllPosts)
router.get('/posts/:id', authenticateToken, PostController.getPostById)
router.put('/posts/:id', authenticateToken, PostController.updatePost)
router.delete('/posts/:id', authenticateToken, PostController.deletePost)

// Роуты комментариев
router.post('/comments', authenticateToken, CommentController.createComment)
router.put('/comments/:id', authenticateToken, CommentController.updateComment)
router.delete('/comments/:id', authenticateToken, CommentController.deleteComment)
router.get('/comments/:id/replies', authenticateToken, CommentController.getCommentReplies)

// Роуты лайков
router.post('/likes', authenticateToken, LikeController.likePost)
router.delete('/likes/:id', authenticateToken, LikeController.unlikePost)

// Роуты подписок
router.post('/follow', authenticateToken, FollowController.followUser)
router.delete('/unfollow/:id', authenticateToken, FollowController.unfollowUser)

// Роуты репостов
router.post('/reposts', authenticateToken, RepostController.createRepost)
router.delete('/reposts/:id', authenticateToken, RepostController.removeRepost)
router.get('/posts/:postId/reposts', authenticateToken, RepostController.getReposts)

// Роуты закладок
router.post('/bookmarks', authenticateToken, BookmarkController.addBookmark)
router.delete('/bookmarks/:id', authenticateToken, BookmarkController.removeBookmark)
router.get('/bookmarks', authenticateToken, BookmarkController.getBookmarks)

// Роуты поиска
router.get('/search/users', authenticateToken, SearchController.searchUsers)
router.get('/search/posts', authenticateToken, SearchController.searchPosts)
router.get('/search/hashtags', authenticateToken, SearchController.searchHashtags)
router.get('/hashtags/:hashtag/posts', authenticateToken, SearchController.getPostsByHashtag)

// Роуты уведомлений
router.get('/notifications', authenticateToken, NotificationController.getNotifications)
router.put('/notifications/:id/read', authenticateToken, NotificationController.markAsRead)
router.put('/notifications/read-all', authenticateToken, NotificationController.markAllAsRead)
router.get('/notifications/unread-count', authenticateToken, NotificationController.getUnreadCount)

module.exports = router;