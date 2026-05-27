import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const sessionCookie = "karma_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "local-development-secret-change-before-production");

export type SessionUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ email: user.email ?? null, phone: user.phone ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const jar = await cookies();
  jar.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(sessionCookie);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secret);
    const userId = verified.payload.sub;
    if (!userId) return null;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return { id: user.id, email: user.email, phone: user.phone };
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    const error = new Error("Unauthenticated");
    error.name = "Unauthenticated";
    throw error;
  }
  return user;
}
