import Task from "../model/Task.model.js";
import User from "../model/User.model.js";
import moment from "moment";
import { scheduleJob } from "node-schedule";
import webpush from "web-push";
import { sendEmail } from "./mailer.js";

export const sendPushNotification = (task) => {
  const days = Math.trunc(
    (new Date(task.deadLine).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );
  console.log(" days", days);
  if (task.notificationFrequency == "daily") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  } else if (task.notificationFrequency == "weekly") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  } else if (task.notificationFrequency == "monthly") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  }
};

export const sendEmailNotification = (task) => {
  const days = Math.trunc(
    (new Date(task.deadLine).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24)
  );
  if (task.notificationFrequency == "daily") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  }
  if (task.notificationFrequency == "weekly") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  }
  if (task.notificationFrequency == "monthly") {
    scheduleJob("* * * * * *", () => {
      publishToClient(days, task);
    });
  }
};

export const addTask = async (request, response) => {
  const {
    title,
    deadLine,
    notificationEnabled,
    notificationType,
    notificationFrequency,
  } = request.body;
  console.log("request ", request.body);
  try {
    //  moment().add(deadLine, "days").format("YYYY-MM-DD"),
    const newTask = await Task.create({
      data: title,
      deadLine,
      notificationEnabled,
      notificationType,
      notificationFrequency,
      user: request.user.userId,
    });

    await newTask.save();

    return response.status(200).json(newTask);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const getAllTasks = async (request, response) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    return response.status(200).json(tasks);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const getCurrentUserTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.userId });

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

export const toggleTaskDone = async (request, response) => {
  try {
    const taskRef = await Task.find();
    const task = taskRef.filter((tasks) => {
      return tasks.done === true;
    });

    return response.status(200).json(task);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const toggleTaskNotDone = async (request, response) => {
  try {
    const taskRef = await Task.find();
    console.log("taskRef", taskRef);
    const task = taskRef.filter((tasks) => {
      if (tasks.done === false) {
        let remainingTime = new Date(tasks.deadLine) - new Date();
        console.log("time ", remainingTime);
      }
    });

    return response.status(200).json(task);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const updateTask = async (request, response) => {
  try {
    let task = await Task.findById(request.params.id).exec();
    if (task) {
      await Task.findOneAndUpdate(
        { _id: request.params.id },
        { data: request.body.data }
      );
    }

    task = await Task.findById(request.params.id);

    return response.status(200).json(task);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const deleteTask = async (request, response) => {
  try {
    let task = await Task.findById(request.params.id);
    if (task.user === request.user.userId) {
      return response.status(401).send("not authorized to delete this task");
    }
    await Task.findByIdAndDelete(request.params.id);

    return response.status(200).json(task);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const statusChange = async (request, response) => {
  try {
    let updatedTask;
    let taskRef = await Task.findById(request.params.id);

    if (taskRef.user === request.user.userId) {
      return response.status(401).send("not authorized to update this task");
    }
    if (taskRef && taskRef.user && request.user.userId) {
      taskRef.done = request.body.done;
      updatedTask = await Task.findByIdAndUpdate(
        {
          _id: request.params.id,
        },
        {
          done: taskRef.done,
        }
      );
    }

    return response.status(200).json(updatedTask);
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export async function getIncompletedTask(req, res) {
  try {
    const Task = await Task.find();
    const Incompletedtask = Task.filter((tasks) => {
      return tasks.done === false;
    });
    res.send(200).json(Incompletedtask);
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

export async function sendNotification(req, res) {
  try {
    const { type, events } = req.body;

    if (type === "INCOMPLETED-TASK") {
      console.log(" came inside ");
      console.log(" events ", events);
      // events.flat(1);
      console.log(
        events.filter((task) => {
          console.log(
            "task.notificationEnabled ==> ",
            task.notificationEnabled
          );
          console.log("task.notificationType ==> ", task.notificationType);
          console.log(
            "task.notificationFrequency ==> ",
            task.notificationFrequency
          );
          if (
            task.notificationEnabled &&
            task.notificationType == "email" &&
            task.notificationFrequency == "daily"
          ) {
            sendEmailNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "email" &&
            task.notificationFrequency == "weekly"
          ) {
            sendEmailNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "email" &&
            task.notificationFrequency == "monthly"
          ) {
            sendEmailNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "push" &&
            task.notificationFrequency == "daily"
          ) {
            sendPushNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "push" &&
            task.notificationFrequency == "weekly"
          ) {
            sendPushNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "push" &&
            task.notificationFrequency == "monthly"
          ) {
            sendPushNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "sms" &&
            task.notificationFrequency == "daily"
          ) {
            sendSmsNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "sms" &&
            task.notificationFrequency == "weekly"
          ) {
            sendSmsNotification(task);
          } else if (
            task.notificationEnabled &&
            task.notificationType == "sms" &&
            task.notificationFrequency == "monthly"
          ) {
            sendSmsNotification(task);
          }
        })
      );
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

const publishToClient = (days, task) => {
  console.log(" days ", days);
  if (task.notificationType === "push") {
    sendPush(days, task);
  } else if (task.notificationType === "email") {
    sendEmail(days, task);
  } else {
    //  sendSms(days, task);
  }
};

export function sendPush(days, task) {
  const payload = JSON.stringify({
    title: `Reminder about deadline of the task ${task.data} `,
    body: `Finish the task within ${days}`,
  });
  console.log("payload ", payload);
}

export function sendSms(days, task) {
  const payload = JSON.stringify({
    title: ` Sms Reminder about deadline of the task ${task.data} `,
    body: ` sms Finish the task within ${days}`,
  });
  console.log("payload ", payload);
}

// =======================================

// Public Key:
// BG27DoFFT_Z1Fp3d_SFTRwvbQ8188RxoY-dn57mtjw_1cu-Rckc3pbIa6k0dIq9VrtImtxNhmb7vnxKqITLvBbM

// Private Key:
// 5sdJs0KqwYgBQx8S5o_n96Bi_plIArT8oatzfaphT9k

// =======================================
