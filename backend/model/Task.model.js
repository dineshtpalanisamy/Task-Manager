import mongoose from "mongoose";
import moment from "moment";
const { Schema } = mongoose;
const TaskSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
      required: true,
      default: false,
    },
    deadLine: {
      type: Date,
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notificationFrequency: {
      type: "String",
      enum: ["weekly", "monthly", "daily"],
      default: "daily",
    },
    notificationType: {
      type: "String",
      enum: ["push", "sms", "email"],
      default: "push",
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const Task = mongoose.model("Task", TaskSchema);

export default Task;
