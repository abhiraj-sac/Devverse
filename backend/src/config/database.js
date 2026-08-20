const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);

        throw error;
    }
};

module.exports = connectDB;