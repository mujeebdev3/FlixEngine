import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },
    price: { type: Number, required: true },
    renewal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subscriptionSchema.index(
  { user: 1, plan: 1 },
  { unique: true, partialFilterExpression: { status: "Active" } }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
