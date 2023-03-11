import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import ENV from "../config.js";

// https://ethereal.email/create
let nodeConfig = {
  host: "hotmail",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "dinesh010995@outlook.com", // generated ethereal user
    pass: "8838629003Dinesh", // generated ethereal password
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;
  console.log(
    " username, userEmail, text, subject",
    username,
    userEmail,
    text,
    subject
  );

  // body of the email
  var email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to Daily Tuition! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from: ENV.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res
        .status(200)
        .send({ msg: "You should receive an email from us." });
    })
    .catch((error) => res.status(500).send({ error }));
};

export const sendEmail = (days, task) => {
  console.log(" came inside ===> sendEmail", days, "\n ", task);
  const options = {
    from: "dinesh010995@outlook.com",
    to: task.email,
    subject: `Reminder of the ${task.data} and deadline is ${days} more`,
    text: `Reminder of the ${task.data} and deadline is ${days} more`,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(info.response);
  });
};
