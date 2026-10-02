const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleWares");
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom, addBlock, removeBlock,getAvailableRooms } = require("../controllers/roomcontroller");

router.get("/", getRooms);
router.get("/available", getAvailableRooms);
router.get("/:id", getRoom);
router.post("/", authMiddleware, createRoom);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);
router.post("/:id/block", authMiddleware, addBlock);
router.delete("/:id/block/:blockId", authMiddleware, removeBlock);

module.exports = router;