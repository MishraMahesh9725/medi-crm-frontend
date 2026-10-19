import { api } from "@/lib/api";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      role: "OWNER" | "PHARMACIST" | "CASHIER";
      storeId: string;
    };
    store: {
      id: string;
      name: string;
      language: string;
    };
  };
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  return api.post<LoginResponse>("/auth/login", input);
}
