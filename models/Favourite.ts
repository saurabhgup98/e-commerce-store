import { Schema, model, models } from "mongoose";

const favouriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default models.Favourite || model("Favourite", favouriteSchema);
