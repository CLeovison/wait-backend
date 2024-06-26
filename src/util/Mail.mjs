//Nodemailer/Forgot Username Password
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export default async function Mail(options) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.APP_PASSWORD, // Note That The Password That Needs to be in here is the password from app password in google
    },
  });

  const mailOptions = {
    from: "cleovison@gmail.com",
    to: options.email,
    subject: "Forgot Password",
    text: "Here is your password link: " + options.link,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
