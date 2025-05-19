import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TypeSafeEnv } from "ts-typesafe-env";
import { Token } from "../models/index.js";
const generateToken = async (res, userId, role) => {
  try {
    const uniqueAccessTokenValue = uuidv4();
    const accessToken = jwt.sign(
      { userId, role, uniqueAccessTokenValue },
      TypeSafeEnv.getString("ACCESS_TOKEN_SECRET"),
      {
        expiresIn: TypeSafeEnv.getString("ACCESS_TOKEN_EXPIRY"),
      }
    );
    // console.log("accessToken: " + accessToken);

    const refreshToken = jwt.sign(
      { userId, role, uniqueAccessTokenValue },
      TypeSafeEnv.getString("REFRESH_TOKEN_SECRET"),
      { expiresIn: TypeSafeEnv.getString("REFRESH_TOKEN_EXPIRY") }
    );
    // console.log("refreshToken: " + refreshToken);

    await Token.findOneAndUpdate(
      { userId }, // Find the user
      { token: refreshToken }, // Update the refresh token
      { upsert: true } // Create a new token if it doesn't exist
    );

    // console.log("refreshToken: " + refreshToken);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // return token;
    // console.log("Token generated:", token); // Log token to confirm it was created
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      message: "Error generating token",
      success: false,
      error: true,
    });
  }
  // console.log("generating token for userId", userId);
  // console.log("JWT ", process.env.JWT_SECRET);
};
export default generateToken;
