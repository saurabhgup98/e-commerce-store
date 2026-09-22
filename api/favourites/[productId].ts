import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db.js";
import { requireSession } from "../_lib/session.js";
import Favourite from "../../models/Favourite.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const { productId } = req.query;
  if (typeof productId !== "string") {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  await connectDB();
  await Favourite.findOneAndUpdate(
    { userId: session.userId },
    { $pull: { productIds: productId } }
  );

  res.status(200).json({ ok: true });
}
