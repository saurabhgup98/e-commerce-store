import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const favouriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default models.Favourite || model("Favourite", favouriteSchema);
