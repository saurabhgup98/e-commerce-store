import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db";
import { requireSession } from "../_lib/session";
import Favourite from "../../models/Favourite";

const addSchema = z.object({ productId: z.string().min(1) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  await connectDB();

  if (req.method === "GET") {
    const favourite = await Favourite.findOne({ userId: session.userId }).populate("productIds");
    res.status(200).json({ products: favourite?.productIds ?? [] });
    return;
  }

  if (req.method === "POST") {
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }
    await Favourite.findOneAndUpdate(
      { userId: session.userId },
      { $addToSet: { productIds: parsed.data.productId } },
      { upsert: true }
    );
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
