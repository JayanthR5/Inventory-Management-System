const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `Inventory Management System <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
