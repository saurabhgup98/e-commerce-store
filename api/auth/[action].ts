import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { connectDB } from "../_lib/db.js";
import { hashPassword, verifyPassword, signSession } from "../_lib/auth.js";
import { setSessionCookie, clearSessionCookie, getSession } from "../_lib/session.js";
import User from "../../models/User.js";

// A single dynamic route (/api/auth/:action) standing in for what would be
// four separate endpoints — kept as one function so this project's total
// serverless function count stays under the Vercel Hobby plan's limit.

const signupSchema = z.object({
  mobile: z.string().trim().min(10).max(15),
  password: z.string().min(6).max(100),
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
});

const loginSchema = z.object({
  mobile: z.string().trim().min(1),
  password: z.string().min(1),
});

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid signup details" });
  const { mobile, password, firstName, lastName } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ mobile });
  if (existing) return res.status(409).json({ error: "An account with this mobile number already exists" });

  const passwordHash = await hashPassword(password);
  const user = await User.create({ mobile, passwordHash, firstName, lastName });

  const token = await signSession({ userId: user._id.toString(), mobile: user.mobile });
  setSessionCookie(res, token);

  res.status(201).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid mobile or password" });
  const { mobile, password } = parsed.data;

  await connectDB();

  const user = await User.findOne({ mobile });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid mobile or password" });
  }

  const token = await signSession({ userId: user._id.toString(), mobile: user.mobile });
  setSessionCookie(res, token);

  res.status(200).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const session = await getSession(req);
  if (!session) return res.status(200).json({ user: null });

  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return res.status(200).json({ user: null });

  res.status(200).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  switch (action) {
    case "signup":
      return handleSignup(req, res);
    case "login":
      return handleLogin(req, res);
    case "logout":
      return handleLogout(req, res);
    case "me":
      return handleMe(req, res);
    default:
      res.status(404).json({ error: "Not found" });
  }
}
