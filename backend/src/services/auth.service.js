const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }
    );
};

const createRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        }
    );
};

const buildAuthResponse = (user) => {
    return {
        user: {
            id: user._id,
            fullName: user.fullName || "",
            username: user.username,
            email: user.email,
            bio: user.bio,
            headline: user.headline || "",
            location: user.location || "",
            website: user.website || "",
            github: user.github || "",
            skills: Array.isArray(user.skills) ? user.skills : [],
            availability: user.availability || "",
        },
        accessToken: createAccessToken(user),
        refreshToken: createRefreshToken(user),
    };
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    buildAuthResponse,
};
