import mongoose from "mongoose";
import { TypeSafeEnv } from "ts-typesafe-env";

const connectDB = async () => {
  try {
    await mongoose.connect(`${TypeSafeEnv.getString("MONGODB_URI")}`);
    console.log("connected successfully");
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};
export default connectDB;
