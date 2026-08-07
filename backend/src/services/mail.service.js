const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"DevHub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your DevHub Login OTP",
        html: `
            <h2>DevHub Login Verification</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP will expire in 2 minutes.</p>

            <p>If you didn't request this OTP, please ignore this email.</p>
        `,
    });
};

module.exports = {
    sendOTPEmail,
};