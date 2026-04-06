import { jwtVerify, SignJWT } from "jose";
import { config } from "@/app/config";

export type TokenPayload = {
  id: string;
  email: string;
  name: string | null;
  slug: string;
  roles: string[];
};

const getSecret = () => {
  const secret = config.auth.jwtSecret;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
};

export const signToken = async (payload: TokenPayload): Promise<string> => {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as TokenPayload;
};

export const getUserIdFromToken = async (token: string): Promise<string | null> => {
  try {
    const payload = await verifyToken(token);
    return payload.id;
  } catch {
    return null;
  }
};
