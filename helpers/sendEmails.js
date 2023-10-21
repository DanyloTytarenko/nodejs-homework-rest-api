const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  const { EMAIL, PASSWORD } = process.env;

  const nodemailerConfig = {
    host: "smtp.meta.ua",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };

  const transport = nodemailer.createTransport(nodemailerConfig);

  const email = {
    to,
    from: EMAIL,
    subject,
    html,
  };

  transport
    .sendMail(email)
    .then(() => console.log("email send succsess"))
    .catch((err) => console.log("err.message :>> ", err.message));
};

module.exports = sendEmail;
