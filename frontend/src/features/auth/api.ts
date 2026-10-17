import { request } from "@/lib/api/client";

import type { LoginData, RegisterData, User } from "./types";

export function getMe(): Promise<User> {
  return request("/api/auth/me");
}

export function login(data: LoginData): Promise<User> {
  return request("/api/auth/login", "POST", data);
}

export function register(data: RegisterData): Promise<User> {
  return request("/api/auth/register", "POST", data);
}

export function logout(): Promise<void> {
  return request("/api/auth/logout", "POST");
}
