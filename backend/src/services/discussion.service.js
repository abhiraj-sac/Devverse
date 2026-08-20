const Discussion = require("../modules/discussion/Discussion");
const Message = require("../modules/discussion/Message");

const createDiscussion = async (title, userId) => {
    const discussion = await Discussion.create({
        title,
        createdBy: userId,
    });

    return discussion;
};

const getDiscussions = async () => {
    const discussions = await Discussion.find()
        .populate("createdBy", "username fullName")
        .sort({ createdAt: -1 });

    return discussions;
};

const getMessages = async (discussionId) => {
    const messages = await Message.find({ discussionId })
        .populate("senderId", "username fullName")
        .sort({ createdAt: 1 });

    return messages;
};

const sendMessage = async (discussionId, senderId, content) => {
    const message = await Message.create({
        discussionId,
        senderId,
        content,
    });

    return message;
};

module.exports = {
    createDiscussion,
    getDiscussions,
    getMessages,
    sendMessage,
};