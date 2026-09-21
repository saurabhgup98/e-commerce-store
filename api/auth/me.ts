import type { VercelRequest, VercelResponse } from "@vercel/node";
import { connectDB } from "../_lib/db";
import { getSession } from "../_lib/session";
import User from "../../models/User";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const session = await getSession(req);
  if (!session) {
    res.status(200).json({ user: null });
    return;
  }

  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) {
    res.status(200).json({ user: null });
    return;
  }

  res.status(200).json({
    user: { id: user._id, mobile: user.mobile, firstName: user.firstName, lastName: user.lastName },
  });
}
