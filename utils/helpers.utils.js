import { Token } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing " });
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      TypeSafeEnv.getString("REFRESH_TOKEN_SECRET")
    );

    const tokenDoc = await Token.findOne({
      userId: decodedRefreshToken.userId,
      token: refreshToken,
    });
    if (!tokenDoc) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const uniqueAccessTokenValue = uuidv4();
    // Generate a new access token
    const newAccessToken = jwt.sign(
      {
        userId: decodedRefreshToken.userId,
        role: decodedRefreshToken.role,
        uniqueAccessTokenValue,
      },

      { expiresIn: TypeSafeEnv.getString("ACCESS_TOKEN_EXPIRY") }
    );
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.cookie("access_token", newAccessToken, cookieOptions);
    req.userId = decodedRefreshToken.userId;
    req.role = decodedRefreshToken.role;
    return next();
  } catch (refreshError) {
    console.error("Couldn't refresh token", refreshError.message);
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};
export default refreshToken;
