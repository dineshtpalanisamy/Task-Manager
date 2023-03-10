import UserModel from "../model/User.model.js";
import validate from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config.js";
import otpGenerator from "otp-generator";
import Joi from "joi";

function validateUser(user) {
  const schema = {
    username: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };
  return Joi.validate(user, schema);
}
/** middleware for verify user */
export async function verifyUser(req, res, next) {
  try {
    console.log(" came inside verify user ");
    console.log(" 22222came inside verify user ");

    const { username } = req.method == "GET" ? req.query : req.body;
    // check the user existance
    let exist = await UserModel.findOne({ username });
    console.log(" EXIST ", exist);
    if (!exist) return res.status(404).send({ error: "Can't find User!" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

export async function register(req, res) {
  try {
    let hashedPassword;

    const { username, password, profile, email } = req.body;

    const data = await UserModel.findOne({ email: email });

    if (data) {
      return res.status(400).send("That user already exisits!");
    } else {
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      const user = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || "",
        email,
      });
      user
        .save()
        .then((result) =>
          res.status(201).send({ msg: "User Register Successfully" })
        )
        .catch((error) => res.status(500).send({ error }));
    }
  } catch (error) {
    return res.send(error.message);
  }
}

export async function login(req, res) {
  console.log(" came inside login ");
  const { username, password, email } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: "no user found" });
    } else {
      let passwordCheck = await bcrypt.compare(password, user.password);

      if (!passwordCheck) {
        return res.status(400).send({ error: "Don't have Password" });
      }
      const payload = {
        id: user._id,
        name: user.username,
      };
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
        },
        ENV.JWT_SECRET,
        { expiresIn: "24h" }
      );
      console.log(" token JWT ", token);

      return res.status(200).json({
        username: user.username,
        email: user.email,
        msg: "login success",
        token: token,
      });
    }
  } catch (error) {
    return res.status(500).send({ error });
  }
}

export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });

    UserModel.findOne({ username }, function (err, user) {
      if (err) return res.status(500).send({ err });
      if (!user)
        return res.status(501).send({ error: "Couldn't Find the User" });

      /** remove password from user */
      // mongoose return unnecessary data with object so convert it into json
      const { password, ...rest } = Object.assign({}, user.toJSON());

      return res.status(201).send(rest);
    });
  } catch (error) {
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
}

export async function updateUser(req, res) {
  try {
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      const body = req.body;
      const resp = await UserModel.updateOne({ _id: userId }, body);
      if (!resp) {
        return res.status(401).send({ error: "User Not Found...!" });
      } else {
        return res.status(201).send({ msg: "Record Updated...!" });
      }
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

export async function generateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

export async function verifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
  }
  return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: "Session expired!" });

    const { username, password } = req.body;
    try {
      const user = await UserModel.findOne({ username });
      if (!user) {
        return res.status(404).send({ error: "Username not Found" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        if (hashedPassword) {
          const result = await UserModel.updateOne(
            { username: user.username },
            { password: hashedPassword }
          );
          if (result) {
            req.app.locals.resetSession = false; // reset session
            return res.status(201).send({ msg: "Record Updated...!" });
          }
        } else {
          return res.status(500).send({
            error: "Enable to hashed password",
          });
        }
      }
    } catch (err) {
      res.send(err.message);
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}
