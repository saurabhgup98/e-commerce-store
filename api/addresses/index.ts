import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db.js";
import { requireSession } from "../_lib/session.js";
import Address from "../../models/Address.js";

const createSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  pincode: z.string().trim().min(4).max(10),
  phone: z.string().trim().min(6).max(15),
  isDefault: z.boolean().optional().default(false),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await requireSession(req, res);
  if (!session) return;

  await connectDB();

  if (req.method === "GET") {
    const addresses = await Address.find({ userId: session.userId }).sort({ createdAt: -1 });
    res.status(200).json({ addresses });
    return;
  }

  if (req.method === "POST") {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }
    if (parsed.data.isDefault) {
      await Address.updateMany({ userId: session.userId }, { $set: { isDefault: false } });
    }
    const address = await Address.create({ ...parsed.data, userId: session.userId });
    res.status(201).json({ address });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
