const express = require("express");
const router = express.Router();

const { createpost, getpost } = require("../controllers/post.controller");
const { likePost, unlikepost } = require("../controllers/like.controller");
const { createcomment } = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");

// Post
router.post("/posts/create", protect, createpost);
router.get("/posts", getpost);

// Comment
router.post("/comments/create", protect, createcomment);

// Like
router.post("/likes", protect, likePost);
router.post("/likes/unlike", protect, unlikepost);

module.exports = router;