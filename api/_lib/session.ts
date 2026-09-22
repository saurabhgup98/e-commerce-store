import { stringifySetCookie } from "cookie";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AUTH_COOKIE_NAME } from "./constants.js";
import { verifySession, type SessionPayload } from "./auth.js";

const isProd = process.env["NODE_ENV"] === "production";

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  );
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    stringifySetCookie({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
}

// Reads and verifies the session cookie from an incoming request. Returns
// null for anonymous requests or an invalid/expired token — callers decide
// whether that's an error (protected route) or fine (optional-auth route).
export async function getSession(req: VercelRequest): Promise<SessionPayload | null> {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(
  req: VercelRequest,
  res: VercelResponse
): Promise<SessionPayload | null> {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return session;
}
