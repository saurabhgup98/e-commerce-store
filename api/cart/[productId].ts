import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db.js";
import { requireSession } from "../_lib/session.js";
import Cart from "../../models/Cart.js";
// Registers the Product schema in this function's isolated module graph —
// required for .populate("items.productId") to resolve, since each Vercel
// function bundles its own dependencies independently.
import "../../models/Product.js";

const patchSchema = z.object({ quantity: z.number().int().min(0) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  const { productId } = req.query;
  if (typeof productId !== "string") {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  await connectDB();

  if (req.method === "PATCH") {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid quantity" });
      return;
    }
    const cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }
    if (parsed.data.quantity === 0) {
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId) as never;
    } else {
      const item = cart.items.find((item: any) => item.productId.toString() === productId);
      if (!item) {
        res.status(404).json({ error: "Item not in cart" });
        return;
      }
      item.quantity = parsed.data.quantity;
    }
    await cart.save();
    await cart.populate("items.productId");
    res.status(200).json({ items: cart.items });
    return;
  }

  if (req.method === "DELETE") {
    await Cart.findOneAndUpdate(
      { userId: session.userId },
      { $pull: { items: { productId } } }
    );
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
