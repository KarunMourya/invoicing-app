import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp: number;
  User?: string;
  Company?: string;
}

export const isTokenValid = (token: string | null) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    console.log('decoded: ', decoded);

    if (!decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
};
