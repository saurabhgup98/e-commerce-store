import mongoose from "mongoose";
import { PRODUCT_CATEGORIES } from "../api/_lib/constants.js";

const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    price: { type: Number, required: true },
    specs: { type: Map, of: String, default: {} },
    description: { type: String, default: "" },
    imagePlaceholder: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Product || model("Product", productSchema);
