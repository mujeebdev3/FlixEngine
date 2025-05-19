import { Schema, Types, model } from "mongoose";

const SubscriptionStatus = [
  "pending_activation",
  "trialing",
  "active",
  "renewal_due",
  "canceled",
  "expired",
  "payment_failed",
  "grace",
  "paused",
  "cancel_at_period_end",
  "cancelled",
];

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    planSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    gateway: { type: String, require: true },
    gatewaySubscriptionId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: SubscriptionStatus,
      default: "pending_activation",
    },
    startDate: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEndDate: Date,
    cancelAtPerioidEnd: { type: Boolean, default: false },
    cacelledAt: Date,
    nextBillingAttemptAt: Date,
    lastPaymentAttemptId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    paymentMethodId: Schema.Types.Mixed,
    prorationCredits: { type: Number, default: 0 },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

const Subscription = model("Subscription", SubscriptionSchema);

export default Subscription;
