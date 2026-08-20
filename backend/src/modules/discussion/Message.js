const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        discussionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discussion",
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { 
        timestamps: true,
    }
);

messageSchema.index({ discussionId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);