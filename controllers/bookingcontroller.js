const Room = require("../models/room");
const Booking = require("../models/booking");
const { findAvailableRooms } = require("../utils/availability");

exports.createBooking = async (req, res) => {
    try {
        const { room: roomId, guestName, phone } = req.body;
        const checkIn = new Date(req.body.checkIn);
        const checkOut = new Date(req.body.checkOut);
        const guests = Number(req.body.guests);

        if (!roomId || !guestName || !phone) {
            return res.status(400).json({ message: "room, guestName and phone are required" });
        }
        if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
            return res.status(400).json({ message: "Valid dates are required, and checkOut must be after checkIn" });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (checkIn < today) {
            return res.status(400).json({ message: "checkIn can't be in the past" });
        }
        if (!Number.isInteger(guests) || guests < 1) {
            return res.status(400).json({ message: "guests must be a whole number of 1 or more" });
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        if (guests > room.capacity) {
            return res.status(400).json({ message: `This room fits at most ${room.capacity} guests` });
        }

        // re-check availability right before saving, never trust the earlier list
        const available = await findAvailableRooms(checkIn, checkOut, guests);
        const stillFree = available.some((r) => r._id.equals(room._id));
        if (!stillFree) {
            return res.status(409).json({ message: "Sorry, this room is no longer available for those dates" });
        }

        const booking = await Booking.create({
            room: room._id,
            guestName: guestName.trim(),
            phone: phone.trim(),
            checkIn,
            checkOut,
            guests,
        });

        res.status(201).json(booking);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid room id" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const VALID_STATUSES = ["pending", "confirmed", "cancelled"];

exports.getBookings = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const bookings = await Booking.find(filter)
            .populate("room", "roomNumber floor")
            .sort({ checkIn: 1 });

        res.status(200).json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "status must be pending, confirmed or cancelled" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === "cancelled" && status !== "cancelled") {
            return res.status(409).json({
                message: "Cancelled bookings can't be reactivated. Create a new booking instead.",
            });
        }

        booking.status = status;
        await booking.save();
        res.status(200).json(booking);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid booking id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};