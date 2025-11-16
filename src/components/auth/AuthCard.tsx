import { Card, CardContent } from "@mui/material";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>{children}</CardContent>
    </Card>
  );
}
