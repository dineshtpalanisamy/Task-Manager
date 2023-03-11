import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./router/route.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import webpush from "web-push";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.disable("x-powered-by"); // less hackers know about our stack

app.use(express.static(path.join(__dirname, "client.js")));

const port = 8080;

const publicVapidKey =
  "BG27DoFFT_Z1Fp3d_SFTRwvbQ8188RxoY-dn57mtjw_1cu-Rckc3pbIa6k0dIq9VrtImtxNhmb7vnxKqITLvBbM";

const privateVapidKey = "5sdJs0KqwYgBQx8S5o_n96Bi_plIArT8oatzfaphT9k";
webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);
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
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({
    title: "Hello World",
    body: "This is your first push notification",
  });

  webpush.sendNotification(subscription, payload).catch(console.log);
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
