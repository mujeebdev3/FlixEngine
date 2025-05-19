import nodemailer from "nodemailer";
import { TypeSafeEnv } from "ts-typesafe-env";
export const sendResetPasswordEmail = async (
  name,
  email,
  resetToken,
  messageType
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or any other email provider
    auth: {
      user: TypeSafeEnv.getString("EMAIL_ADDRESS"),
      pass: TypeSafeEnv.getString("EMAIL_PASSWORD"),
    },
  });

  let subject, text;

  if (messageType === "password-reset") {
    subject = "🔐 Password Reset Instructions";
    text = `Dear ${name},

We received a request to reset your password. To proceed, please click the link below or copy and paste it into your browser:

http://localhost:8000/api/v1/admin/reset-password/${resetToken}

This link will expire shortly for security reasons. If you did not request a password reset, please ignore this email or contact support.

Best regards,  
Support Team`;
  } else if (messageType === "password-updated") {
    subject = "✅ Password Successfully Updated";
    text = `Hello ${name},

This is to confirm that your account password was successfully updated on ${new Date().toLocaleString()}.

If you did not perform this action, please reset your password immediately or contact our support team.

Thank you,  
Support Team`;
  } else {
    subject = "ℹ️ Notification";
    text =
      messageType ||
      "This is a system-generated message regarding your account.";
  }

  const mailOptions = {
    from: TypeSafeEnv.getString("EMAIL_ADDRESS"),
    to: email,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};
