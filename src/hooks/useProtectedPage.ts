import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/tokens";
import { isTokenValid } from "../lib/authGuard";

export function useProtectedPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      const valid = isTokenValid(token);

      if (!valid) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    };
    checkAuth();
  }, [router]);

  return { checking };
}
