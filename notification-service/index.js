const express = require("express");
const cors = require("cors");
const http = require("http");
const schedule = require("node-schedule");
const mongoose = require("mongoose");
const PORT = 8008;
const bodyParser = require("body-parser");
const Task = require("../notification-service/model/TaskModel");
const app = express();
const axios = require("axios");

const server = http.createServer();
app.use(express.json());
app.use(cors());

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.disable("x-powered-by");
mongoose.connect(
  `mongodb+srv://dbUser:0000@cluster0.jo5owox.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const getTask = async (req, res) => {
  try {
    const task = await Task.find();
    return task;
  } catch (err) {
    console.log("err", err);
  }
};

const cronJob = async () => {
  schedule.scheduleJob("*/5 * * * * *", async (req, res) => {
    const result = await getTask();
    let events = [];
    const resp = result.filter((task) => {
      if (!task.done && task.notificationEnabled) {
        return task;
      }
    });
    events.push(
      ...result.filter((task) => {
        if (!task.done && task.notificationEnabled) {
          return task;
        }
      })
    );
    await axios.post("http://localhost:8080/api/events", {
      type: "INCOMPLETED-TASK",
      events,
    });
  });
};

server.listen(PORT, () => {
  console.log(`notification server started successfully on ${PORT}`);
});

cronJob();
