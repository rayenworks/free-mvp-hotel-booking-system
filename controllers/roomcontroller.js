const Room = require("../models/room");
const Booking = require("../models/booking");
const { findAvailableRooms } = require("../utils/availability");

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json(room);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid room id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Room number already exists" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        delete req.body.blockedPeriods;
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json(room);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Room number already exists" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid room id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const hasBookings = await Booking.exists({ room: req.params.id });
        if (hasBookings) {
            return res.status(409).json({
                message: "This room has bookings and can't be deleted. Block it instead.",
            });
        }

        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(200).json({ message: "Room deleted" });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid room id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.addBlock = async (req, res) => {
    try {
        const { from, to, reason } = req.body;
        const start = new Date(from);
        const end = new Date(to);

        if (!from || !to || isNaN(start) || isNaN(end) || end <= start) {
            return res.status(400).json({ message: "Valid 'from' and 'to' dates are required, and 'to' must be after 'from'" });
        }

        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // refuse if an active booking overlaps this period
        const conflict = await Booking.exists({
            room: room._id,
            status: { $in: ["pending", "confirmed"] },
            checkIn: { $lt: end },
            checkOut: { $gt: start },
        });
        if (conflict) {
            return res.status(409).json({ message: "A booking overlaps this period. Cancel or move it first." });
        }

        room.blockedPeriods.push({ from: start, to: end, reason });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid room id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.removeBlock = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const block = room.blockedPeriods.id(req.params.blockId);
        if (!block) {
            return res.status(404).json({ message: "Blocked period not found" });
        }

        room.blockedPeriods.pull(req.params.blockId);
        await room.save();
        res.status(200).json(room);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid id" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getAvailableRooms = async (req, res) => {
    try {
        const checkIn = new Date(req.query.checkIn);
        const checkOut = new Date(req.query.checkOut);
        const guests = Number(req.query.guests);

        if (isNaN(checkIn) || isNaN(checkOut)) {
            return res.status(400).json({ message: "Valid checkIn and checkOut dates are required" });
        }
        if (checkOut <= checkIn) {
            return res.status(400).json({ message: "checkOut must be after checkIn" });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (checkIn < today) {
            return res.status(400).json({ message: "checkIn can't be in the past" });
        }

        if (!Number.isInteger(guests) || guests < 1) {
            return res.status(400).json({ message: "guests must be a whole number of 1 or more" });
        }

        const rooms = await findAvailableRooms(checkIn, checkOut, guests);
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

