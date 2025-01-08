import nodemailer from "nodemailer";
import { TypeSafeEnv } from "ts-typesafe-env";
export const sendResetPasswordEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or any other email provider
    auth: {
      user: TypeSafeEnv.getString("EMAIL_ADDRESS"),
      pass: TypeSafeEnv.getString("EMAIL_PASSWORD"),
    },
  });

  const mailOptions = {
    from: TypeSafeEnv.getString("EMAIL_ADDRESS"),
    to: email,
    subject: "Password Reset Request",
    text: `To reset your password, please click the link below or copy-paste it into your browser:
    
    http://your-domain.com/reset-password/${resetToken}
    
    If you didn't request this, please ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};
