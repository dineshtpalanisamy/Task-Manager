import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./router/route.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.disable("x-powered-by"); // less hackers know about our stack

const port = 8080;
mongoose.set("strictQuery", false);
mongoose.connect(
  `mongodb+srv://dbUser:0000@cluster0.jo5owox.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

/** HTTP GET Request */
app.get("/", (req, res) => {
  res.status(201).json("Home GET Request");
});

/** api routes */
app.use("/api", router);

/** start server only when we have valid connection */
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.listen(port, () => {
  console.log(`"Server is running at port " ${port}`);
});
