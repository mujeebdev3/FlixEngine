import jwt from "jsonwebtoken";
import { TypeSafeEnv } from "ts-typesafe-env";

import { refreshToken } from "../utils/index.js";

const authMiddleware = (Roles = []) => {
  return async (req, res, next) => {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      return res.status(401).json({
        message: "Access token missing",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        accessToken,
        TypeSafeEnv.getString("ACCESS_TOKEN_SECRET")
      );
      req.userId = decoded.userId;
      req.role = decoded.role;

      // Role-based access control
      if (Roles.length > 0 && !Roles.includes(req.role)) {
        return res.status(403).json({
          message: "You are not authorized to access this resource",
          error: true,
          success: false,
        });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message); // Debug log
      if (error.name === "TokenExpiredError") {
        return refreshToken(req, res, next);
      }

      return res.status(401).json({ message: "Invalid access token" });
    }
  };
};

export { authMiddleware };
