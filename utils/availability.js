const Room = require("../models/room");
const Booking = require("../models/booking");

exports.findAvailableRooms = async (checkIn, checkOut, guests) => {
    // ids of rooms that have an active booking overlapping these dates
    const bookedRoomIds = await Booking.distinct("room", {
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    });

    return Room.find({
        capacity: { $gte: guests },
        _id: { $nin: bookedRoomIds },
        blockedPeriods: {
            $not: { $elemMatch: { from: { $lt: checkOut }, to: { $gt: checkIn } } },
        },
    }).sort({ pricePerNight: 1 });
};
