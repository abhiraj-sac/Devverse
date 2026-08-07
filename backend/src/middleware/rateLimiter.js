const redis = require("../config/redis");

const MAX_REQUESTS = 5;
const WINDOW_TIME = 60; // seconds

const loginRateLimiter = async (req, res, next) => {
    try {
        // User ki IP address
        const ip = req.ip;

        // Redis Key
        const key = `login:${ip}`;

        // Current Count
        const requests = await redis.get(key);

        console.log("Current Count:", requests);

        if (!requests) {
            // First Request
            await redis.set(key, 1, "EX", WINDOW_TIME);
            console.log("Key Saved");
            return next();
        }

        if (Number(requests) >= MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: "Too many login attempts. Please try again after 1 minute.",
            });
        }

        // Increment Counter
        await redis.incr(key);
        const updated = await redis.get(key);
        console.log("Updated Count:", updated);        

        next();

    } catch (error) {
        console.error(error);

        // Agar Redis down ho to login block mat karo
        next();
    }
};

module.exports = loginRateLimiter;