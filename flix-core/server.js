import { TypeSafeEnv } from "ts-typesafe-env";
import { connectDB } from "./config/index.js";

import { errorHandler } from "./middlewares/index.js";
import cookieParser from "cookie-parser";
import e from "express";
import {
  adminRouter,
  authRouter,
  userRouter,
  movieRouter,
} from "./routes/index.js";
import subscriptionRouter from "./routes/subscription.Routes.js";
import PaymentRouter from "./routes/payment.Routes.js";

const PORT = TypeSafeEnv.getNumber("PORT") || 8000;
const app = e();

app.use(cookieParser());
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/user", userRouter);

app.use("/api/v1/admin", adminRouter);

app.use("/api/v1/movies", movieRouter);

app.use("/api/v1/subscription", subscriptionRouter);

app.use("/api/v1", PaymentRouter);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port : ${PORT}`);
  });
});

app.get("/", (req, res) => {
  res.send("⚙️ Server is running and responding successfully");
});
