import { UserService } from "../services/index.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/index.js";

class userController {
  async userDetailsController(req, res, next) {
    try {
      const userId = req.userId;
      const user = await UserService.userDetails(userId);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.OPERATION_SUCCESSFUL,
        data: user,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }
  async updateUser(req, res, next) {
    try {
      const userId = req.userId;
      const userData = req.body;
      const updatedUser = await UserService.updateUserDetails(userData, userId);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        data: updatedUser,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }

  async forgetPassword(req, res, next) {
    try {
      const { identifier } = req.body;
      const response = await UserService.forgotPassword(identifier);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.OPERATION_SUCCESSFUL,
        data: response,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      const response = await UserService.resetPassword(resetToken, newPassword);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.PASSWORD_RESET,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new userController();
