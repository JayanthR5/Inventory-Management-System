const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const toSafeUser = (user) => {
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    return userObject;
};

const register = async (req, res) => {
    try {
        const {name, email, password}= req.body;
        // check user exist or not
        const IsUserExist = await User.findOne({email});
        if(IsUserExist) return res.status(400).json({message:"User already exisit"})
        //Secure password 
        const hashedPassword= await bcrypt.hash(password, 10);
        // The first account owns the inventory; public signups after that remain staff.
        const isFirstUser = await User.countDocuments() === 0;
        //Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: isFirstUser ? "admin" : "staff"
        });
        //sign token
        const token = jwt.sign({email, id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"}); 
        res.status(201).json({
            message:"User registered successfully",
            user: toSafeUser(user),
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not register user"});
    }
};

const login = async (req, res) => {
    try {
        const {email, password}= req.body;
        //check user exist or not
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"User not found"});
        //check password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched) return res.status(400).json({message:"Invalid credentials"});
        //sign token
        const token = jwt.sign( {email, id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"}); 
        res.status(200).json({
            message:"User logged in successfully",
            user: toSafeUser(user),
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not login user"});
    }
};

const getMe = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({message:"User found successfully", user});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Could not find user"});
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
                <p>Please click on the button below to complete the process:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${resetUrl}</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Token",
                html,
            });

            res.status(200).json({ message: "Email sent" });
        } catch (error) {
            console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Set new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword
};
