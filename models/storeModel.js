const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const storeSchema = mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        address: { type: String },
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
            },
            formattedAddress: String,
        },
        image: { type: String },
        info: { type: String },
        reviews: [
            {
                star: { type: Number, required: true, default: 5, min: 1, max: 5 },
                content: { type: String, trim: true },
                images: [{ type: String }],
                date: { type: Date, default: Date.now },
                userId: { type: mongoose.Types.ObjectId, ref: "user" },
            },
        ],
    },
    { timestamps: true }
);

// Geocoder & createLocation;
storeSchema.pre("save", async function (next) {
    if (this.address) {
        const location = await geocoder.geocode(this.address);
        this.location = {
            type: "Point",
            coordinates: [location[0].longitude, location[0].latitude],
            formattedAddress: location[0].formattedAddress,
        };
        this.address = undefined;
    }

    next();
});
module.exports = mongoose.model("store", storeSchema);
