const express = require("express");

const {
    createDiscussion,
    getDiscussions,
    getMessages,
} = require("../controllers/discussion.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createDiscussion);

router.get("/", protect, getDiscussions);

router.get("/:discussionId/messages", protect, getMessages);

module.exports = router;