import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db";
import { hashPassword, signSession } from "../_lib/auth";
import { setSessionCookie } from "../_lib/session";
import User from "../../models/User";

const signupSchema = z.object({
  mobile: z.string().trim().min(10).max(15),
  password: z.string().min(6).max(100),
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid signup details" });
    return;
  }
  const { mobile, password, firstName, lastName } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ mobile });
  if (existing) {
    res.status(409).json({ error: "An account with this mobile number already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ mobile, passwordHash, firstName, lastName });

  const token = await signSession({ userId: user._id.toString(), mobile: user.mobile });
  setSessionCookie(res, token);

  res.status(201).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}
