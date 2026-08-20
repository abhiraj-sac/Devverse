require("dotenv").config();
const { Worker } = require("bullmq");
const { sendOTPEmail } = require("../services/mail.service");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
const worker = new Worker(
    "email",
    async (job) => {
        console.log("Processing job:", job.id);
        console.log("Job name:", job.name);
        console.log("Job data:", job.data);

        if (job.name === "send-otp") {
            await sendOTPEmail(
                job.data.email,
                job.data.otp
            );
        }
    },
    {
       connection: {
    host: new URL(process.env.REDIS_URL).hostname,
    port: Number(new URL(process.env.REDIS_URL).port),
},
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`❌ Job ${job.id} failed`);
    console.log(err.message);
});