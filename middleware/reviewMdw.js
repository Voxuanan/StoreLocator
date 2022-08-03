const Stores = require("../models/storeModel");
const jwt = require("jsonwebtoken");

const reviewMdw = {
    isReview: async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const store = await Stores.findOne({ _id: storeId, "reviews.userId": req.user._id });
            if (store) {
                return res.json({ success: false, msg: "This user already review this store" });
            }
            next();
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
};

module.exports = reviewMdw;
