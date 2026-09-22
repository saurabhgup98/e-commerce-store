import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.js";
import Product from "../../models/Product.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  await connectDB();

  const product = await Product.findById(id).catch(() => null);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(200).json({ product });
}
