const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");


console.log(
    process.env.MONGO_URI
        ? "MONGO_URI is loaded"
        : "MONGO_URI is NOT loaded"
);
connectDB();

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static("public"));
app.use("/api/admin", require("./routes/adminroutes"));
app.use("/api/rooms", require("./routes/roomroutes"));
app.use("/api/bookings", require("./routes/bookingroutes"));

app.get("/", (req, res) => {
    res.json({
        msg: "server running well",
    });
});

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});