import mongoose from "mongoose";

import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      required: true,
      trim: true,
    },
    email: {
      type: "String",
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
      type: "String",
      required: true,
    },
    role: {
      type: "String",
      enum: ["superadmin", "admin", "moderator"],
      default: "admin",
    },

    isActive: {
      type: "Boolean",
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
    },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFAToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
