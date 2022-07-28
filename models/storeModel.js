const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const storeSchema = mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        address: { type: String, required: true },
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
    },
    { timestamps: true }
);

// Geocoder & createLocation
storeSchema.pre("save", async function (next) {
    const location = await geocoder.geocode(this.address);

    this.location = {
        type: "Point",
        coordinates: [location[0].longitude, location[0].latitude],
        formattedAddress: location[0].formattedAddress,
    };
    this.address = undefined;
    next();
});
module.exports = mongoose.model("store", storeSchema);
