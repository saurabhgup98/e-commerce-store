import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db";
import { requireSession } from "../_lib/session";
import Address from "../../models/Address";

const updateSchema = z.object({
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

  const { id } = req.query;
  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid address id" });
    return;
  }

  await connectDB();

  // Every handler re-checks that the resource belongs to the session's user,
  // not just that a session exists — an id in the URL never implies access.
  const address = await Address.findOne({ _id: id, userId: session.userId }).catch(() => null);
  if (!address) {
    res.status(404).json({ error: "Address not found" });
    return;
  }

  if (req.method === "PUT") {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }
    if (parsed.data.isDefault) {
      await Address.updateMany({ userId: session.userId }, { $set: { isDefault: false } });
    }
    Object.assign(address, parsed.data);
    await address.save();
    res.status(200).json({ address });
    return;
  }

  if (req.method === "DELETE") {
    await address.deleteOne();
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
