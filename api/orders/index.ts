import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db.js";
import { requireSession } from "../_lib/session.js";
import Cart from "../../models/Cart.js";
import Address from "../../models/Address.js";
import Order from "../../models/Order.js";
// Registers the Product schema in this function's isolated module graph —
// required for .populate("items.productId") to resolve, since each Vercel
// function bundles its own dependencies independently.
import "../../models/Product.js";

const createSchema = z.object({ addressId: z.string().min(1) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  await connectDB();

  if (req.method === "GET") {
    const orders = await Order.find({ userId: session.userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
    return;
  }

  if (req.method === "POST") {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid checkout request" });
      return;
    }

    const address = await Address.findOne({ _id: parsed.data.addressId, userId: session.userId });
    if (!address) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const cart = await Cart.findOne({ userId: session.userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const items: { productId: unknown; name: string; category: string; price: number; quantity: number }[] =
      cart.items.map((item: any) => ({
        productId: item.productId._id,
        name: item.productId.name,
        category: item.productId.category,
        price: item.productId.price,
        quantity: item.quantity,
      }));
    const totalAmount = items.reduce((sum: number, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: session.userId,
      items,
      addressSnapshot: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
      },
      totalAmount,
      status: "pending_payment",
    });

    res.status(201).json({ order });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
