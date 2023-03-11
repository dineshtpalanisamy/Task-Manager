import { Router } from "express";
const router = Router();

/** import all controllers */
import * as controller from "../controllers/appController.js";
import {
  addTask,
  getAllTasks,
  toggleTaskDone,
  updateTask,
  deleteTask,
  getCurrentUserTasks,
  toggleTaskNotDone,
  statusChange,
  getIncompletedTask,
  sendNotification,
  sendPush,
} from "../controllers/taskController.js";
import { registerMail } from "../controllers/mailer.js";
import Auth, { localVariables } from "../middleware/auth.js";

/** POST Methods */
router.route("/tasks").post(Auth, addTask);
router.route("/events").post(sendNotification);
router.route("/subscribe").post(sendPush);

router.route("/register").post(controller.register); // register user
router.route("/registerMail").post(registerMail); // send the email
router
  .route("/authenticate")
  .post(controller.verifyUser, (req, res) => res.end()); // authenticate user
router.route("/login").post(controller.verifyUser, controller.login); // login in app

/** GET Methods */
router.route("/tasks").get(getAllTasks);
router.route("/tasks/undone").get(getIncompletedTask);
router.route("/tasks/toggletasks").get(toggleTaskDone);
router.route("/tasks/toggleTaskNotDone").get(toggleTaskNotDone);
router.route("/tasks").get(Auth, getCurrentUserTasks);
router.route("/user/:username").get(controller.getUser); // user with username
router
  .route("/generateOTP")
  .get(controller.verifyUser, localVariables, controller.generateOTP); // generate random OTP
router.route("/verifyOTP").get(controller.verifyUser, controller.verifyOTP); // verify generated OTP
router.route("/createResetSession").get(controller.createResetSession); // reset all the variables

/** PUT Methods */
router.route("/tasks/completed/:id").put(Auth, statusChange);
router.route("/tasks/:id").put(Auth, updateTask);
router.route("/updateuser").put(Auth, controller.updateUser); // is use to update the user profile
router
  .route("/resetPassword")
  .put(controller.verifyUser, controller.resetPassword); // use to reset password

/* Delete methods */
router.route("/tasks/:id").delete(Auth, deleteTask);
export default router;
