import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db";
import { verifyPassword, signSession } from "../_lib/auth";
import { setSessionCookie } from "../_lib/session";
import User from "../../models/User";

const loginSchema = z.object({
  mobile: z.string().trim().min(1),
  password: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid mobile or password" });
    return;
  }
  const { mobile, password } = parsed.data;

  await connectDB();

  const user = await User.findOne({ mobile });
  // Generic message either way — don't leak which field was wrong.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid mobile or password" });
    return;
  }

  const token = await signSession({ userId: user._id.toString(), mobile: user.mobile });
  setSessionCookie(res, token);

  res.status(200).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}
