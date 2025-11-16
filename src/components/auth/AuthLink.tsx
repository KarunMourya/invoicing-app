import { Typography, Link, Box } from "@mui/material";
import { useRouter } from "next/navigation";

interface AuthLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthLink({ text, linkText, href }: AuthLinkProps) {
  const router = useRouter();

  return (
    <Box sx={{ textAlign: "center", mt: 3 }}>
      <Typography variant="body2" sx={{ color: "#757575", fontSize: 14 }}>
        {text}{" "}
        <Link
          component="button"
          onClick={() => router.push(href)}
          sx={{
            color: "#525252",
            fontWeight: 500,
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {linkText}
        </Link>
      </Typography>
    </Box>
  );
}
