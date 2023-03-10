import Task from "../model/Task.model.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";

export const sendPushNotification = (task) => {
  if (task.notificationFrequency == "daily") {
    scheduleJob("* * * * * *", () => {
      let currentDate = new Date();
      let daysToComplete =
        new Date(task.deadLine).getTime() - currentDate.getTime();

      const days = new Date(
        Math.floor(daysToComplete / (1000 * 60 * 60 * 24))
      ).toDateString();
      publishToClient(days);
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
      publishToClient(days);
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
      publishToClient(days);
    });
  }
};

export const addTask = async (request, response) => {
  const { title, deadLine } = request.body;
  let date = new Date();
  try {
    const newTask = await Task.create({
      data: title,
      deadLine: date.getTime() + deadLine,
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
    let data;

    if (type === "INCOMPLETED-TASK") {
      events.flat(1);
      console.log(
        events.filter((task, index) => {
          if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "daily"
          ) {
            sendPushNotification(task[index]);
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "weekly"
          ) {
            // sendPushNotification(task[index]);
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "push" &&
            task[index].notificationFrequency == "monthly"
          ) {
            // sendPushNotification(task[index]);
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "daily"
          ) {
            // sendSmsNotification(task[index])
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "weekly"
          ) {
            // sendSmsNotification(task[index])
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "sms" &&
            task[index].notificationFrequency == "monthly"
          ) {
            // sendSmsNotification(task[index])
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "daily"
          ) {
            // sendEmailNotification(task[index])
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "weekly"
          ) {
            // sendEmailNotification(task[index])
          } else if (
            task[index].notificationEnabled &&
            task[index].notificationType == "email" &&
            task[index].notificationFrequency == "monthly"
          ) {
            // sendEmailNotification(task[index])
          }
        })
      );
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
