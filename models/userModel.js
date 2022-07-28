const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            trim: true,
            maxlength: 25,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        avatar: {
            type: String,
            default: "./images/avatar.png",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
