import { authApi, setToken, setRefreshToken, clearToken } from "./api";
import type { AuthUser, LoginResult } from "./types";

export async function login(email: string, password: string): Promise<AuthUser> {
  // POST http://localhost:5000/api/v1/auth/login
  // -> { success, message, data: { user, tokens: { accessToken, refreshToken, expiresIn } } }
  const result = await authApi.post<LoginResult>("/auth/login", { email, password });
  setToken(result.tokens.accessToken);
  setRefreshToken(result.tokens.refreshToken);
  return result.user;
}

export async function fetchMe(): Promise<AuthUser> {
  // GET http://localhost:5000/api/v1/auth/me
  // Accepts either `{ ...user }` or `{ user: { ...user } }` as the unwrapped
  // payload, since that detail can vary by deployment.
  const result = await authApi.get<AuthUser | { user: AuthUser }>("/auth/me");
  return "user" in result ? result.user : result;
}

export function logout() {
  clearToken();
}
