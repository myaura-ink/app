"use server";

import { cookies } from "next/headers";
import { getAuthTokenFromCookies, getUserById, getUserIdFromToken } from "@/lib";

export const getUserFromCookie = async () => {
  const authToken = getAuthTokenFromCookies(await cookies());
  const userId = authToken ? await getUserIdFromToken(authToken) : null;
  const user = userId ? await getUserById(userId) : null;
  return user;
};
