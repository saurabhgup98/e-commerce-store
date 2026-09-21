import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db";
import { requireSession } from "../_lib/session";
import Cart from "../../models/Cart";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  await connectDB();

  if (req.method === "GET") {
    const cart = await Cart.findOne({ userId: session.userId }).populate("items.productId");
    res.status(200).json({ items: cart?.items ?? [] });
    return;
  }

  if (req.method === "POST") {
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid cart item" });
      return;
    }
    const { productId, quantity } = parsed.data;

    let cart = await Cart.findOne({ userId: session.userId });
    if (!cart) {
      cart = await Cart.create({ userId: session.userId, items: [{ productId, quantity }] });
    } else {
      const existing = cart.items.find((item: any) => item.productId.toString() === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity } as never);
      }
      await cart.save();
    }

    await cart.populate("items.productId");
    res.status(200).json({ items: cart.items });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
