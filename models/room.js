const mongoconnect = require("mongoose");

const rooms = new mongoconnect.Schema({
    roomNumber : {
        type : String,
        required : true,
        unique: true,
    },
    floor : {
        type : Number,
        required : true,
    },
    capacity : {
        type: Number,
        required : true,
    },
    pricePerNight : {
        type: Number,
        required: true,
    },
    amenities: [String],
    blockedPeriods: [
        {
            from: { type: Date, required: true },
            to: { type: Date, required: true },
            reason: String,
        },
    ],
});


module.exports = mongoconnect.model("room", rooms);