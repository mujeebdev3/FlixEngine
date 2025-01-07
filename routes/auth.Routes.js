import e from "express";

import { authController } from "../controllers/index.js";

const authRouter = e.Router();

authRouter.post("/signup", authController.userSignupController);
authRouter.post("/signin", authController.userSignInController);

authRouter.delete("/logout", authController.userLogoutController);
export default authRouter;
