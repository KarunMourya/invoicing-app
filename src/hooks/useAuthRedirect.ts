import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/src/lib/tokens";
import { isTokenValid } from "@/src/lib/authGuard";

export function useAuthRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      const valid = isTokenValid(token);

      if (valid) {
        router.replace("/dashboard");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router]);

  return { checking };
}
