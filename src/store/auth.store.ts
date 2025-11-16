import { create } from "zustand";
import { setToken, clearToken } from "../lib/tokens";

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Company {
  companyId: number;
  companyName: string;
  currencySymbol: string;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;

  login: (token: string, user: User, company: Company, remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  company: null,
  token: null,

  login: (token, user, company, remember) => {
    setToken(token, remember);
    set({ token, user, company });
  },

  logout: () => {
    clearToken();
    set({ token: null, user: null, company: null });
  },
}));
