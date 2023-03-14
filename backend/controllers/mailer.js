import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import ENV from "../config.js";
import User from "../model/User.model.js";

// https://ethereal.email/create
let nodeConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "dineshpalanisamy010995@gmail.com", // generated ethereal user
    pass: "jikjtswxrshjvuds", // generated ethereal password
  },
};

let transporter = nodemailer.createTransport(nodeConfig);
transporter.verify().then(console.log).catch(console.error);

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

export const sendEmail = async (days, task) => {
  const user = await User.findOne({ _id: task.user });
  console.log(" days ", days);
  const options = {
    from: "dineshpalanisamy010995@gmail.com",
    to: "thisisdinezz3020@gmail.com",
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
