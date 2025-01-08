import UserRepository from "../repositories/index.js";
import { BadRequestError, NotFoundError } from "../utils/index.js";
import sendResetPasswordEmail from "../jobs/index.js";
import { ERROR_MESSAGES, REGEX_PATTERNS } from "../config/index.js";
import crypto from "crypto";

class UserService {
  async userDetails(userId) {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    // console.log("userdetails", user.password);
    return {
      userDetails: {
        _id: user._id,
        email: user.email,
        phoneNr: user.phoneNr,
        role: user.role,
        user,
      },
    };
  }
  async updateUserDetails(userData, userId) {
    const { email, phoneNr, name } = userData;
    if (!userData || Object.keys(userData).length === 0) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_INPUT);
    }

    if (email && !REGEX_PATTERNS.EMAIL.test(email)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_EMAIL);
    }
    if (phoneNr && !REGEX_PATTERNS.PHONE.test(phoneNr)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_PHONE);
    }

    if (!email && !phoneNr && !name) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_INPUT);
    }

    const updatedUser = await UserRepository.updateUserDetails(
      userId,
      userData
    );

    return {
      updatedUserDetails: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNr: updatedUser.phoneNr,
      },
    };
  }

  async forgotPassword(identifier) {
    const isEmail = REGEX_PATTERNS.EMAIL.test(identifier);
    const isPhone = REGEX_PATTERNS.PHONE.test(identifier);

    if (!isEmail && !isPhone) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const condition = isEmail
      ? { email: identifier }
      : { phoneNr: identifier.trim() };

    const user = await UserRepository.findUserByCondition(condition);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("reset token", resetToken);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    await sendResetPasswordEmail(user.email, resetToken);

    return {
      response: ERROR_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT,
    };
  }

  async resetPassword(resetToken, newPassword) {
    const user = await UserRepository.findUserByCondition({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    // console.log("user", user);
    if (!user) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }
    user.password = newPassword;
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    user.markModified("password");
    await user.save();
  }
}

export default new UserService();
