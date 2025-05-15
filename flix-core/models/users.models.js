import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      require: [true, "Email is required"],
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "is invalid"],
    },
    phoneNr: {
      type: String,
      unique: true,
      index: true,
      match: /^\d{10}$|^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/,
    },
    password: {
      type: String,

      require: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFAToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to Compare Password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
