import { Token } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

import { TypeSafeEnv } from "ts-typesafe-env";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token;
  // console.log("refresh", refreshToken);
  if (!refreshToken) {
    return false;
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      TypeSafeEnv.getString("REFRESH_TOKEN_SECRET")
    );
    // console.log("decodedRefreshToken", decodedRefreshToken);

    const tokenDoc = await Token.findOne({
      userId: ObjectId.createFromHexString(decodedRefreshToken.userId),

      token: refreshToken,
    });
    // console.log("tokendoc", tokenDoc);
    if (!tokenDoc) {
      return false;
    }
    const uniqueAccessTokenValue = uuidv4();
    // Generate a new access token
    const newAccessToken = jwt.sign(
      {
        userId: ObjectId.createFromHexString(decodedRefreshToken.userId),
        role: decodedRefreshToken.role,
        uniqueAccessTokenValue,
      },
      TypeSafeEnv.getString("ACCESS_TOKEN_SECRET"),

      { expiresIn: TypeSafeEnv.getString("ACCESS_TOKEN_EXPIRY") }
    );
    // console.log("newtoken", newAccessToken);
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("access_token", newAccessToken, cookieOptions);
    req.userId = decodedRefreshToken.userId;
    req.role = decodedRefreshToken.role;

    return newAccessToken;
  } catch (refreshError) {
    console.error("Couldn't refresh token", refreshError.message);
    return false;
  }
};
export default refreshToken;
