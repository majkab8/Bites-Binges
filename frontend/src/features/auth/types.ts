import type { components } from "@/lib/api/schema";

type Schemas = components["schemas"];

export type User = Schemas["User"];

export type LoginData = Schemas["LoginRequest"];

export type RegisterData = Schemas["RegisterRequest"];
