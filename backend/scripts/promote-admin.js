const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/UserModel");

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error("Usage: npm run promote-admin -- user@example.com");
    process.exitCode = 1;
} else {
    (async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            const user = await User.findOneAndUpdate(
                { email },
                { role: "admin" },
                { new: true }
            ).select("name email role");

            if (!user) {
                throw new Error(`No user found for ${email}`);
            }

            console.log(`Admin role granted to ${user.email}`);
        } catch (error) {
            console.error(`Unable to promote user: ${error.message}`);
            process.exitCode = 1;
        } finally {
            await mongoose.disconnect();
        }
    })();
}
