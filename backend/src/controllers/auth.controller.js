const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../modules/auth/user/user.model");
const {
    buildAuthResponse,
    createAccessToken,
} = require("../services/auth.service");

exports.signup = async (req, res) => {
    try {
        const { fullName, username, email, password, bio } = req.body;

        if (!username || !email || !password || !bio) {
            return res.status(400).json({
                success: false,
                message: "username, email, password and bio are required",
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName: fullName || "",
            username,
            email,
            password: hashedPassword,
            bio,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: buildAuthResponse(user),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        console.log("Login is called ")
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: buildAuthResponse(user),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "refreshToken is required",
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Access token refreshed",
            data: {
                accessToken: createAccessToken(user),
            },
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Protected route accessed successfully",
            data: user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            "fullName",
            "username",
            "bio",
            "headline",
            "location",
            "website",
            "github",
            "availability",
            "skills",
        ];
        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (typeof updates.skills === "string") {
            updates.skills = updates.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
        }

        if (Array.isArray(updates.skills)) {
            updates.skills = updates.skills
                .map((skill) => `${skill}`.trim())
                .filter(Boolean);
        }

        if (typeof updates.username === "string") {
            const existingUser = await User.findOne({
                username: updates.username,
                _id: { $ne: req.user.userId },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken",
                });
            }
        }

        updates.updatedAt = new Date();

        const user = await User.findByIdAndUpdate(req.user.userId, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: buildAuthResponse(user),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
