import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // jo subscribe krra hai
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // to whom subscribing
      ref: "User",
    },
  },
  {
     timestamps: true
}
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
