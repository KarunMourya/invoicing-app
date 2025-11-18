import { Company, User } from "../store/auth.store";

export const getlocalStorageToken = (key: string) =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

export const getsessionStorageToken = (key: string) =>
  typeof window !== "undefined" ? sessionStorage.getItem(key) : null;

export const getToken = () => {
  const localToken = getlocalStorageToken("token");
  if (localToken) return localToken;

  const sessionToken = getsessionStorageToken("token");
  if (sessionToken) return sessionToken;

  return null;
};

export const setToken = (token: string, remember: boolean) => {
  if (remember) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
};

export const saveUserAndCompanyInfo = (
  user: User,
  company: Company,
  remember: boolean
) => {
  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("user", JSON.stringify(user));
  storage.setItem("company", JSON.stringify(company));
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const local = localStorage.getItem("user");
  if (local) return JSON.parse(local) as User;

  const session = sessionStorage.getItem("user");
  if (session) return JSON.parse(session) as User;

  return null;
};

export const getCompany = (): Company | null => {
  if (typeof window === "undefined") return null;

  const local = localStorage.getItem("company");
  if (local) return JSON.parse(local) as Company;

  const session = sessionStorage.getItem("company");
  if (session) return JSON.parse(session) as Company;

  return null;
};
