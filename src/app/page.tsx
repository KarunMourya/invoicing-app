"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { isTokenValid } from "../lib/authGuard";
import { getToken } from "../lib/tokens";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const valid = isTokenValid(token);

    if (valid) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
}
