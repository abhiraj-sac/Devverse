require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const connectDB = require("./src/config/database");
const { sendMessage } = require("./src/services/discussion.service");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

// Socket.IO
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join discussion
    socket.on("joinDiscussion", (discussionId) => {
        socket.join(discussionId);

        console.log(
            `Socket ${socket.id} joined discussion ${discussionId}`
        );
    });

    // Send message
    socket.on(
        "sendMessage",
        async ({ discussionId, senderId, content }) => {
            try {
                const message = await sendMessage(
                    discussionId,
                    senderId,
                    content
                );

                io.to(discussionId).emit("newMessage", message);
            } catch (error) {
                console.error("Send Message Error:", error);

                socket.emit("messageError", {
                    message: error.message,
                });
            }
        }
    );

    // Disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server failed to start");
    }
};

startServer();