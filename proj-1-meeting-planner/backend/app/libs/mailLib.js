const nodemailer = require("nodemailer");



async function sendMail(mailOptions) {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'chaser156@gmail.com',
            pass: 'redshirt@123',
        },
    });

    let info = await transporter.sendMail(mailOptions);

}

module.exports.sendMail = sendMail;