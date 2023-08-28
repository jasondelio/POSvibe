const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const categoryRouter = require("./routes/category-route");
const tableRouter = require("./routes/table-route");
const productRouter = require("./routes/product-route");
const orderRouter = require("./routes/order-route");

const redis = require("redis");
const setUpSocketIoServer = require("./socket-io");

const connectMongoDB = require("./configuration/mongo-configuration");
const connectRedis = require("./configuration/redis-configuration");

const redisClient = redis.createClient({ url: "redis://127.0.0.1:6379" });

require("dotenv").config();
const app = express();

connectMongoDB();
connectRedis(redisClient);

app.use(bodyParser.json({ limit: "16mb" }));
app.use(bodyParser.urlencoded({ limit: "16mb", extended: true }));

const socketIoApp = http.createServer();
setUpSocketIoServer(socketIoApp, redisClient);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/table", tableRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

socketIoApp.listen(5001, () => {
  console.log("Socket.IO server is running on port 5001");
});

module.exports = app;
