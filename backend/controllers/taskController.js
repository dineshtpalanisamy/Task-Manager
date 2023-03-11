import Task from "../model/Task.model.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import webpush from "web-push";
import { sendEmail } from "./mailer.js";

export const sendPushNotification = (task) => {
  console.log(" came inside push notification", task);
  if (task.notificationFrequency == "daily") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  } else if (task.notificationFrequency == "weekly") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  } else if (task.notificationFrequency == "monthly") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  }
};

export const sendEmailNotification = (task) => {
  console.log(" came inside email notification servise ", task);
  if (task.notificationFrequency == "daily") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  }
  if (task.notificationFrequency == "weekly") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  }
  if (task.notificationFrequency == "monthly") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days, task);
    });
  }
};

export const addTask = async (request, response) => {
  const { title, deadLine } = request.body;
  console.log(" title ", title);
  console.log(" deadLine ", deadLine);
  let date = new Date();
  try {
    const newTask = await Task.create({
      data: title,
      deadLine: date.getTime() + deadLine,
      user: request.user.userId,
    });
    console.log(" newTask ", newTask);

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
      events.flat(1);
      console.log(
        events.filter((task, index) => {
          console.log(" task ===> ", task[index].notificationType);
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "daily"
          ) {
            sendEmailNotification(task[index]);
          }

          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "daily"
          ) {
            sendPushNotification(task[index]);
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "weekly"
          ) {
            // sendPushNotification(task[index]);
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "monthly"
          ) {
            // sendPushNotification(task[index]);
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "daily"
          ) {
            // sendSmsNotification(task[index])
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "weekly"
          ) {
            // sendSmsNotification(task[index])
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "monthly"
          ) {
            // sendSmsNotification(task[index])
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "daily"
          ) {
            sendEmailNotification(task[index]);
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "weekly"
          ) {
            sendEmailNotification(task[index]);
          }
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "monthly"
          ) {
            sendEmailNotification(task[index]);
          }
        })
      );
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
}

function publishToClient(days, task) {
  console.log(" publishToClient", days, task);
  if (task.notificationType === "email") {
    sendEmail(days, task);
  } else if (task.notificationType === " push") {
    sendPush(days, task);
  } else {
    // sendSms(days, task);
  }
}

export function sendPush(days, task) {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({
    title: `Reminder about deadline of the task ${task.data} `,
    body: `Finish the task within ${days}`,
  });

  webpush.sendNotification(subscription, payload).catch(console.log);
}

// =======================================

// Public Key:
// BG27DoFFT_Z1Fp3d_SFTRwvbQ8188RxoY-dn57mtjw_1cu-Rckc3pbIa6k0dIq9VrtImtxNhmb7vnxKqITLvBbM

// Private Key:
// 5sdJs0KqwYgBQx8S5o_n96Bi_plIArT8oatzfaphT9k

// =======================================
