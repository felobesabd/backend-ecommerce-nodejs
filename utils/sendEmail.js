const nodemailer = require("nodemailer");

const sendEmail = async (options)=> {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, //if secure is false, it uses 587, by default, and 465 if true
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

// async..await is not allowed in global scope, must use a wrapper
    const main = {
        from: "felotest1@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.text,
    }
    // 3) Send email
    await transporter.sendMail(main);
}

module.exports = sendEmail;

