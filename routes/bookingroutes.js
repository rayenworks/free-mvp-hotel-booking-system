const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleWares");
const {
    createBooking,
    getBookings,
    updateBookingStatus,
} = require("../controllers/bookingcontroller");

// public
router.post("/", createBooking);

// admin only
router.get("/", authMiddleware, getBookings);
router.patch("/:id/status", authMiddleware, updateBookingStatus);

module.exports = router;