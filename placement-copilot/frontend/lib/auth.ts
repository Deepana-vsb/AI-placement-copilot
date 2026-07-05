import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_for_development";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");

  if (!tokenCookie) {
    return null;
  }

  const payload = verifyToken(tokenCookie.value);
  if (!payload) {
    return null;
  }

  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId) });
  
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    college: user.college,
    branchYear: user.branchYear,
    createdAt: user.createdAt,
  };
}
