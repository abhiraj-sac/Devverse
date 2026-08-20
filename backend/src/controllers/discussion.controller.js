const {
    createDiscussion: createDiscussionService,
    getDiscussions: getDiscussionsService,
    getMessages: getMessagesService,
} = require("../services/discussion.service");

const createDiscussion = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.userId;

        const discussion = await createDiscussionService(
            title,
            userId
        );

        return res.status(201).json({
            success: true,
            message: "Discussion created successfully",
            discussion,
        });
    } catch (error) {
        console.error("Create Discussion Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getDiscussions = async (req, res) => {
    try {
        const discussions = await getDiscussionsService();

        return res.status(200).json({
            success: true,
            discussions,
        });
    } catch (error) {
        console.error("Get Discussions Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { discussionId } = req.params;

        const messages = await getMessagesService(discussionId);

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.error("Get Messages Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createDiscussion,
    getDiscussions,
    getMessages,
};