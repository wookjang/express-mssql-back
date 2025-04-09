// app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const memberRouter = require("./routes/member");

const app = express();

// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:9000", // 프론트 도메인
    credentials: true, // ✅ 쿠키, 세션 허용
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ 공통 /api prefix 처리
const apiRouter = express.Router();
apiRouter.use("/users", usersRouter);
apiRouter.use("/member", memberRouter);
apiRouter.use("/", indexRouter);
app.use("/api", apiRouter);

module.exports = app;
