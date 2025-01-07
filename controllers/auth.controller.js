import { AuthService } from "../services/index.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/index.js";

class authController {
  async userSignupController(req, res, next) {
    try {
      const userData = req.body;
      const user = await AuthService.signUpUser(userData, res);
      res.status(STATUS_CODES.CREATED).json({
        message: SUCCESS_MESSAGES.USER_REGISTERED,
        data: user,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }

  async userSignInController(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const user = await AuthService.signInUser(identifier, password, res);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        data: user,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }

  async userLogoutController(req, res, next) {
    try {
      AuthService.logoutUser(req, res);
      return res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.USER_LOGGED_OUT,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new authController();
