import { UserRepository, AdminRepository } from "../repositories/index.js";

import {
  BadRequestError,
  generateToken,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/index.js";
import { validateSignup } from "../validations/index.js";
import { ERROR_MESSAGES, REGEX_PATTERNS, ROLES } from "../config/index.js";

class AuthService {
  async signUpUser(userData, res, type) {
    // console.log("incomming response ", userData);

    const { name, email, password, phoneNr } = userData;
    validateSignup(email, password, phoneNr, name);
    if (!REGEX_PATTERNS.EMAIL.test(email)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_EMAIL);
    }
    if (!REGEX_PATTERNS.PASSWORD.test(password)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_REGEX_PASSWORD);
    }
    if (!REGEX_PATTERNS.PHONE.test(phoneNr)) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_PHONE);
    }
    const condition = { $or: [{ email }, { phoneNr }] };
    if (type === "user") {
      const existingUser = await UserRepository.findUserByCondition(condition);

      if (existingUser) {
        throw new ConflictError(ERROR_MESSAGES.USER_EXISTS);
      }
    } else if (type === "admin") {
      const existingAdmin = await AdminRepository.findAdminByCondition(
        condition
      );
      if (existingAdmin) {
        throw new ConflictError(ERROR_MESSAGES.ADMIN_EXISTS);
      }
    }

    // console.log(existingUser);

    const role = type === "user" ? ROLES.USER : ROLES.ADMIN;
    const createMethod =
      type === "user" ? UserRepository.createUser : AdminRepository.createAdmin;
    const savedUser = await createMethod({
      ...userData,
      role,
    });
    // console.log(savedUser);
    await generateToken(res, savedUser._id, savedUser.role);
    return {
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        phoneNr: savedUser.phoneNr,
        role: savedUser.role,
      },
    };
  }

  async signInUser(identifier, password, res, type) {
    const isEmail = REGEX_PATTERNS.EMAIL.test(identifier);
    const isPhone = REGEX_PATTERNS.PHONE.test(identifier);
    if (!isEmail && !isPhone) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const condition = isEmail
      ? { email: identifier }
      : { phoneNr: identifier.trim() };
    const Repository =
      type === "user"
        ? UserRepository.findUserByCondition
        : AdminRepository.findAdminByCondition;

    const user = await Repository(condition);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    const updateRepository =
      type === "user"
        ? UserRepository.updateUserDetails
        : AdminRepository.updateAdminDetails;
    if (isPasswordValid) {
      await updateRepository(user.id, {
        lastLoginAt: new Date(),
      });
      await generateToken(res, user._id, user.role);
      return {
        user: {
          _id: user._id,
          role: user.role,
        },
      };
    }
  }

  async logoutUser(req, res) {
    const options = {
      httpOnly: true,
      secure: req.secure,
    };
    res.clearCookie("access_token", options);
    res.clearCookie("refresh_token", options);
  }
}
export default new AuthService();
