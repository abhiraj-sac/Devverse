const redis = require("../config/redis");

const OTP_EXPIRY = 120;

function otpKey(email) {
    return `otp:${email}`;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveOTP(email, otp) {
    await redis.set(otpKey(email), otp, "EX", OTP_EXPIRY);
}

async function getOTP(email) {
    return await redis.get(otpKey(email));
}

async function deleteOTP(email) {
    return await redis.del(otpKey(email));
}

module.exports = {
    generateOTP,
    saveOTP,
    getOTP,
    deleteOTP,
};