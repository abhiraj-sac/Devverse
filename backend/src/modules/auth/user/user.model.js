const mongoose = require("mongoose");

const user = new mongoose.Schema({
    fullName: {
        type: String,
        maxLength: 80,
        trim: true,
        default: "",
    },
    username: {
        type: String,
        required: true,
        maxLength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxLength: 50,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
        maxLength: 160,
        trim: true,
    },
    headline: {
        type: String,
        maxLength: 120,
        trim: true,
        default: "",
    },
    location: {
        type: String,
        maxLength: 80,
        trim: true,
        default: "",
    },
    website: {
        type: String,
        maxLength: 160,
        trim: true,
        default: "",
    },
    github: {
        type: String,
        maxLength: 120,
        trim: true,
        default: "",
    },
    skills: {
        type: [String],
        default: [],
    },
    availability: {
        type: String,
        maxLength: 60,
        trim: true,
        default: "",
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", user);
