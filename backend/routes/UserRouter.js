const express = require("express");
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/UserController");

const { protect } = require("../middlewares/ProtectRouters");

// User Routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
