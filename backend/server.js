require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

// checking the redis
const redis = require("./src/config/redis");

(async () => {
    await redis.set("test", "hello");
    const value = await redis.get("test");
    console.log(value);
})();

// testing 
// const { sendOTPEmail } = require("./src/services/mail.service");

// (async () => {
//     await sendOTPEmail(
//         "abhirajsachan706@gmail.com",
//         "483921"
//     );

//     console.log("Email Sent");
// })();

startServer();