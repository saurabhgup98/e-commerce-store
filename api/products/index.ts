import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.js";
import { PRODUCT_CATEGORIES } from "../_lib/constants.js";
import Product from "../../models/Product.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await connectDB();

  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const filter: Record<string, unknown> = {};
  if (category) {
    if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
      res.status(400).json({ error: "Unknown category" });
      return;
    }
    filter.category = category;
  }

  const products = await Product.find(filter).sort({ name: 1 });
  res.status(200).json({ products });
}
