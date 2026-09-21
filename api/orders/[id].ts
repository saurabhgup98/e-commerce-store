import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db";
import { requireSession } from "../_lib/session";
import Order from "../../models/Order";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  await connectDB();

  const order = await Order.findOne({ _id: id, userId: session.userId }).catch(() => null);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.status(200).json({ order });
}
