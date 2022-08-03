const Stores = require("../models/storeModel");
const upload = require("../utils/multer");

const storeCtrl = {
    //@desc Get all stores
    //@route GET /api/v1/stores
    //@access Public
    getStores: async (req, res) => {
        try {
            const stores = await Stores.find();
            res.json({ success: true, count: stores.length, data: stores });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
    //@desc Create a store
    //@route POST /api/v1/stores
    //@access Public
    addStore: async (req, res) => {
        try {
            upload(req, res, async (err) => {
                if (err) {
                    res.status(400).json({ msg: "Falure" });
                } else {
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
                }
            });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
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
            });

            res.json({ success: true, count: stores.length, data: stores });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
    //@desc Review stores
    //@route GET /api/v1/stores/review/:storeId
    //@access User already login
    reviewStore: async (req, res) => {
        try {
            const { storeId } = req.params;
            const { star, content } = req.body;
            const store = await Stores.findOne({ _id: storeId });
            if (!store) {
                return res.status(400).json({ success: false, message: "Store not found!" });
            }
            if (!Number.isInteger(star)) {
                return res.status(400).json({ success: false, message: "Start must be a number!" });
            }
            const review = {
                star,
                content,
                images: [],
                userId: req.user._id,
                date: Date.now(),
            };
            store.reviews.push(review);
            store.save();
            res.status(200).json({ success: true, data: review, store });
        } catch (error) {
            res.status(500).json({ error: "Server error: " + error.message });
        }
    },
};

module.exports = storeCtrl;
