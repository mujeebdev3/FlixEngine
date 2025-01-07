import mongoose from "mongoose";
const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 1000 * 60 * 60 * 24 * 7,
  },
});

const Token = mongoose.model("Token", TokenSchema);
export default Token;
