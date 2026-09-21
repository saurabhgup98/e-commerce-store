import { Schema, model, models } from "mongoose";
import { ORDER_STATUSES } from "../api/_lib/constants";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshotted at checkout time — this dataset is never edited after an
    // order is placed, so there's no need for populate() joins later.
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    addressSnapshot: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "pending_payment" },
    cancelledAt: { type: Date },
    returnRequestedAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Order || model("Order", orderSchema);
