import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const setAuthCookies = (store: ReadonlyRequestCookies, token: string) => {
  store.set("_auth_token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const getAuthTokenFromCookies = (cookies: ReadonlyRequestCookies): string | null => {
  const token = cookies.get("_auth_token");
  return token ? token.value : null;
};
