const { Queue } = require("bullmq");

const emailQueue = new Queue("email", {
    connection: {
        url: process.env.REDIS_URL,
    },
});

module.exports = emailQueue;