import e from "express";

import { authController } from "../controllers/index.js";
import { determineUserType } from "../middlewares/index.js";

const authRouter = e.Router();

// User  routes
authRouter.post(
  "/user/signup",
  determineUserType("user"),
  authController.userSignupController
);

authRouter.post(
  "/user/signin",
  determineUserType("user"),
  authController.userSignInController
);

authRouter.delete("/user/logout", authController.userLogoutController);

/**-----------------------------                                                                            --------------------------**/

//Admin  routes

authRouter.post(
  "/admin/signup",
  determineUserType("admin"),
  authController.userSignupController
);

authRouter.post(
  "/admin/signin",
  determineUserType("admin"),
  authController.userSignInController
);

authRouter.delete("/admin/logout", authController.userLogoutController);

export default authRouter;
