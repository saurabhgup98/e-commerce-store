import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db.js";
import { requireSession } from "../_lib/session.js";
import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";

// GET returns order detail. POST performs the pay/cancel/return actions,
// dispatched by an `action` field in the body rather than further path
// segments — Vercel's zero-config Node functions only reliably support a
// single dynamic path segment per file here, not true multi-segment
// catch-alls, so this keeps everything under /api/orders/:id in one
// function (alongside api/orders/index.ts for the bare collection route).
const actionSchema = z.object({ action: z.enum(["pay", "cancel", "return"]) });

async function getOrderForUser(id: string, userId: string) {
  return Order.findOne({ _id: id, userId }).catch(() => null);
}

// Dummy payment gateway: this always succeeds. Kept as its own action
// (rather than folded into order creation) so "order created" and "payment
// completed" remain separately observable events for the tracking SDK.
async function handlePay(res: VercelResponse, id: string, userId: string) {
  const order = await getOrderForUser(id, userId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status !== "pending_payment") {
    return res.status(409).json({ error: `Cannot pay for an order with status ${order.status}` });
  }

  order.status = "confirmed";
  await order.save();
  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  res.status(200).json({ order });
}

async function handleCancel(res: VercelResponse, id: string, userId: string) {
  const order = await getOrderForUser(id, userId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!["pending_payment", "confirmed"].includes(order.status)) {
    return res.status(409).json({ error: `Cannot cancel an order with status ${order.status}` });
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  await order.save();

  res.status(200).json({ order });
}

async function handleReturn(res: VercelResponse, id: string, userId: string) {
  const order = await getOrderForUser(id, userId);
  if (!order) return res.status(404).json({ error: "Order not found" });
  // "confirmed" stands in for "delivered" — this sandbox has no shipment
  // simulation, so there's no separate delivered state to gate on.
  if (order.status !== "confirmed") {
    return res.status(409).json({ error: `Cannot return an order with status ${order.status}` });
  }

  order.status = "return_requested";
  order.returnRequestedAt = new Date();
  await order.save();

  res.status(200).json({ order });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  await connectDB();

  if (req.method === "GET") {
    const order = await getOrderForUser(id, session.userId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json({ order });
    return;
  }

  if (req.method === "POST") {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid action" });
      return;
    }
    if (parsed.data.action === "pay") return handlePay(res, id, session.userId);
    if (parsed.data.action === "cancel") return handleCancel(res, id, session.userId);
    if (parsed.data.action === "return") return handleReturn(res, id, session.userId);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
