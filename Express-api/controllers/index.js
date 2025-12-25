const UserController = require('./user-controller');
const PostController = require('./post-controller');
const CommentController = require('./comment-controller');
const LikeController = require('./like-controller');
const FollowController = require('./follow-controller');
const RepostController = require('./repost-controller');
const BookmarkController = require('./bookmark-controller');
const SearchController = require('./search-controller');
const { NotificationController } = require('./notification-controller');

module.exports = {
    UserController,
    PostController,
    CommentController,
    LikeController,
    FollowController,
    RepostController,
    BookmarkController,
    SearchController,
    NotificationController
}