import e from "express";

import { userController } from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const userRouter = e.Router();

userRouter.get(
  "/user-details",
  authMiddleware(["admin", "user"]),
  userController.userDetailsController
);
userRouter.put(
  "/update-details",
  authMiddleware("user"),
  userController.updateUser
);
userRouter.post("/forgot-password", userController.forgetPassword);

userRouter.post("/reset-password", userController.resetPassword);

export default userRouter;
