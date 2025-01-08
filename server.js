import { TypeSafeEnv } from "ts-typesafe-env";
import { connectDB } from "./flixEngine/config/index.js";

import { errorHandler } from "./flixEngine/middlewares/index.js";
import cookieParser from "cookie-parser";
import e from "express";
import { authRouter, userRouter } from "./flixEngine/routes/index.js";

const PORT = TypeSafeEnv.getNumber("PORT") || 8000;
const app = e();

app.use(cookieParser());
app.use(e.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port : ${PORT}`);
  });
});

app.get("/", (req, res) => {
  res.send("⚙️ Server is running and responding successfully");
});
