import e from "express";

import { adminController } from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const adminRouter = e.Router();

adminRouter.get(
  "/users-details",
  authMiddleware("admin"),
  adminController.getAllUsersDetails
);
adminRouter.put(
  "/update-details",
  authMiddleware("user"),
  adminController.updateAdmin
);
adminRouter.post("/forgot-password", adminController.forgetPassword);

adminRouter.post("/reset-password/:resetToken", adminController.resetPassword);

export default adminRouter;
