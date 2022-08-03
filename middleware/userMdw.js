const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

const userMdw = {
    isLogin: async (req, res, next) => {
        try {
            const token = req.headers["authorization"];

            if (!token) {
                return res.status(400).json({ success: false, msg: "Invalid authorization" });
            }
            const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!decode) {
                return res.status(400).json({ success: false, msg: "Invalid authorization" });
            }
            const user = await Users.findOne({ _id: decode.id });
            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
};

module.exports = userMdw;
