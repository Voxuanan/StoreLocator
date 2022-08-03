const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
    //@desc Register
    //@route POST /api/v1/users/register
    //@access Public
    register: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user_name = await Users.findOne({ username: username });
            if (user_name) return res.status(400).json({ msg: "This username already exist." });
            if (password.length < 6)
                return res.status(400).json({ msg: "Password must be at least 6 characters." });
            const passwordHash = await bcrypt.hash(password, 12);
            const newUser = new Users({
                username,
                password: passwordHash,
            });
            const access_token = createAccessToken({ id: newUser._id });
            const refresh_token = createRefreshToken({ id: newUser._id });
            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            await newUser.save();
            res.json({
                msg: "Register Success!",
                access_token,
                user: { ...newUser._doc, password: "" },
            });
            res.json({ success: true, access_token, data: { ...newUser._doc, password: "" } });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
    //@desc Login
    //@route POST /api/v1/users/login
    //@access Public
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await Users.findOne({ username });
            if (!user) {
                return res.status(400).json({ msg: "This username does not exist." });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Password is incorrect." });
            }

            const access_token = createAccessToken({ id: user._id });
            const refresh_token = createRefreshToken({ id: user._id });
            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.json({ success: true, access_token, data: { ...user._doc, password: "" } });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
    //@desc Logout
    //@route POST /api/v1/users/logout
    //@access Public
    logout: async (req, res) => {
        try {
            res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
    //@desc Generate Access Token
    //@route POST /api/v1/users/refresh_token
    //@access Public
    generateAccessToken: async (req, res) => {
        try {
            const refresh_token = req.cookies.refreshtoken;
            if (!refresh_token) return res.status(400).json({ msg: "Please login." });
            jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
                if (err) return res.status(400).json({ msg: "Please login." });
                const user = await Users.findById(result.id).select("-password");
                if (!user) return res.status(400).json({ msg: "This user does not exist." });
                const access_token = createAccessToken({ id: result.id });
                res.json({ success: true, access_token, data: user });
            });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};
module.exports = authCtrl;
