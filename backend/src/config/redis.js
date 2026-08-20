const Redis = require("ioredis");

console.log("REDIS_URL:", process.env.REDIS_URL);

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
});

module.exports = redis;