
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

async function seed() {
    try {
        // 1. connect
        await mongoose.connect(process.env.MONGO_URI);

        // quick safety check on the raw password (the schema's minlength can't do this)
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
            console.log("Set ADMIN_EMAIL and an ADMIN_PASSWORD of 8+ characters in .env");
            return;
        }

        // 2 + 3. does an admin already exist?
        const existing = await Admin.findOne();
        if (existing) {
            console.log("Admin already exists, nothing to do.");
            return;
        }

        // 4. hash, then save
        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await Admin.create({ email: ADMIN_EMAIL, password: hashed });
        console.log("Admin created.");
    } catch (err) {
        console.error("Seed failed:", err.message);
    } finally {
        // 5. disconnect so the script exits
        await mongoose.disconnect();
    }
}

seed();