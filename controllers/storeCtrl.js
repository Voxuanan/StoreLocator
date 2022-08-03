const Stores = require("../models/storeModel");
const { upload, uploadMutiple } = require("../utils/multer");

const storeCtrl = {
    //@desc Get all stores
    //@route GET /api/v1/stores
    //@access Public
    getStores: async (req, res) => {
        try {
            const stores = await Stores.find().populate("reviews.userId", "-password");
            res.json({ success: true, count: stores.length, data: stores });
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
    //@desc Create a store
    //@route POST /api/v1/stores
    //@access Public
    addStore: async (req, res) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    res.status(400).json({ success: false, msg: "Falure" });
                } else {
                    try {
                        let linkImage = undefined;
                        if (req.file !== undefined) {
                            linkImage = `uploads/${req.file.filename}`;
                        }
                        const { info, name, address } = req.body;
                        const store = await Stores.create({
                            info,
                            name,
                            address,
                            image: linkImage,
                        });
                        res.json({ success: true, count: store.length, data: store });
                    } catch (error) {
                        res.status(500).json({
                            success: false,
                            msg: "Server error: " + error.message,
                        });
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
    //@desc Get all stores geowithin 4 frame north, west, south, east
    //@route POST /api/v1/stores/:north/:west/:south/:east/
    //@access Public
    queryByCoordinates: async (req, res) => {
        try {
            const { east, west, north, south } = req.params;
            const stores = await Stores.find({
                location: {
                    $geoWithin: {
                        $geometry: {
                            type: "Polygon",
                            coordinates: [
                                [
                                    [east, south],
                                    [east, north],
                                    [west, north],
                                    [west, south],
                                    [east, south],
                                ],
                            ],
                        },
                    },
                },
            }).populate("reviews.userId", "-password");

            res.json({ success: true, count: stores.length, data: stores });
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
    //@desc Review stores
    //@route GET /api/v1/stores/review/:storeId
    //@access User already login
    reviewStore: async (req, res) => {
        try {
            uploadMutiple(req, res, async (err) => {
                const { storeId } = req.params;
                let { star = 1, content } = req.body;
                if (star == 0) star = 1;

                // console.log(req.files);
                if (err) {
                    res.status(400).json({ success: false, msg: "Falure" });
                } else {
                    const store = await Stores.findOne({ _id: storeId });
                    if (!store) {
                        return res.status(400).json({ success: false, msg: "Store not found!" });
                    }
                    if (!Number.isInteger(+star)) {
                        return res
                            .status(400)
                            .json({ success: false, msg: "Start must be a number!" });
                    }
                    let images = [];
                    req.files.forEach((file) => {
                        images.push(`uploads/${file.filename}`);
                    });
                    const review = {
                        star,
                        content,
                        images,
                        userId: req.user._id,
                        date: Date.now(),
                    };
                    store.reviews.push(review);
                    store.save();
                    res.status(200).json({ success: true, data: review, store });
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, msg: "Server error: " + error.message });
        }
    },
};

module.exports = storeCtrl;
