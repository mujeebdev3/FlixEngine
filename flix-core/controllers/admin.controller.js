import { AdminService } from "../services/index.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/index.js";

class adminController {
  async getAllUsersDetails(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      //   console.log("page,limit", page, limit);
      const { users, totalUsers } = await AdminService.getAllUsers(page, limit);
      res.status(STATUS_CODES.SUCCESS).json({
        message: SUCCESS_MESSAGES.OPERATION_SUCCESSFUL,

        totalUsers,

        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        users,
        success: true,
        error: false,
      });
    } catch (err) {
      next(err);
    }
  }
  async updateAdmin(req, res, next) {
    try {
      const userId = req.userId;
      const userData = req.body;
      const updatedUser = await AdminService.updateAdminDetails(
        userData,
        userId
      );
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
      console.log("identifier", identifier);

      const response = await AdminService.forgotPassword(identifier);
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
      const { resetToken } = req.params;
      const { newPassword } = req.body;
      console.log("resetToken", resetToken);
      console.log("newPassword", newPassword);

      await AdminService.resetPassword(resetToken, newPassword);
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

export default new adminController();
