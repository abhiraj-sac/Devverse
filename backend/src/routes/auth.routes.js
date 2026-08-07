const express = require("express");
const loginRateLimiter = require("../middleware/rateLimiter");
const {
    signup,
    login,
    refreshAccessToken,
    getMe,
    updateProfile,
    sendOTP,
    verifyOTP
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.post("/login", loginRateLimiter,login);
router.post("/signup", signup);
// router.post("/login", login);
router.post("/send-otp", sendOTP);  
router.post("/refresh-token", refreshAccessToken);
router.get("/me", protect, getMe);
router.post("/verify-otp", verifyOTP);
router.put("/profile", protect, updateProfile);

module.exports = router;
