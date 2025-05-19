import jwt from "jsonwebtoken";
import { TypeSafeEnv } from "ts-typesafe-env";

import { BadRequestError, refreshToken } from "../utils/index.js";

const authMiddleware = (Roles = []) => {
  return async (req, res, next) => {
    let accessToken = req.cookies?.access_token;
    // console.log("access token: " + accessToken);

    if (!accessToken) {
      // next(
      //   new BadRequestError("Access token is missing, attempting to refresh.")
      // );

      const refreshResult = await refreshToken(req, res, next);

      if (!refreshResult) {
        console.log("access token is missing , ", refreshResult);

        return next(new BadRequestError("Refresh token is missing or invalid"));
      }

      // Set the refreshed access token
      accessToken = refreshResult;
    }
    // console.log("newaccess", accessToken);
    if (!accessToken) {
      return res.status(401).json({
        message: "failed to refresh access token",
      });
    }
    try {
      const decoded = jwt.decode(accessToken);

      const currentTime = Math.floor(Date.now() / 1000);
      // console.log(currentTime, decoded);
      if (decoded.exp <= currentTime) {
        console.log("🔄 Access token expired, trying to refresh...");

        const newAccessToken = await refreshToken(req, res, next);
        if (!newAccessToken) {
          return next(new BadRequestError("failed to refresh access token"));
        }
        accessToken = newAccessToken;
      }

      // Verify token

      const verifiedToken = jwt.verify(
        accessToken,
        TypeSafeEnv.getString("ACCESS_TOKEN_SECRET")
      );
      // console.log("decoded", decoded);
      req.userId = verifiedToken.userId;
      req.role = verifiedToken.role;

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
      next(error);
    }
  };
};

export { authMiddleware };
