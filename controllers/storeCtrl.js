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
};

module.exports = storeCtrl;
