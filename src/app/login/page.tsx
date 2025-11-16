"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { loginService } from "../../services/auth.service";
import { getToken } from "@/src/lib/tokens";
import { isTokenValid } from "@/src/lib/authGuard";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter a valid email.")
    .email("Enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be 8-20 characters.")
    .max(20, "Password must be 8-20 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginForm extends LoginFormData {
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(true);

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginService,
    onSuccess: (res) => {
      login(res.token, res.user, res.company, form.rememberMe);
      router.push("/dashboard");
    },
  });

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

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({
        email: form.email,
        password: form.password,
      });

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      mutate({
        email: form.email.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleFieldChange = (
    field: keyof LoginForm,
    value: string | boolean
  ) => {
    setForm({ ...form, [field]: value });
    if (typeof value === "string") {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (checking) {
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

  const isFormValid = form.email && form.password;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          borderBottom: 1,
          borderColor: "#E5E5E5",
          bgcolor: "white",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReceiptIcon sx={{ color: "#262626", mr: 1 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: "#262626",
            fontSize: 20,
          }}
        >
          InvoiceApp
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 200, mb: 0.5, color: "#212121" }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: "#757575" }}>
            Log in to your account.
          </Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  component="label"
                  htmlFor="email"
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: "#424242",
                    display: "block",
                  }}
                >
                  Email Address*
                </Typography>
                <TextField
                  id="email"
                  fullWidth
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onKeyPress={handleKeyPress}
                  error={!!errors.email}
                  helperText={errors.email}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.875rem",
                      "& fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#737373",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#212121",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "#d32f2f",
                      mx: 0,
                      mt: 0.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  htmlFor="password"
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: "#424242",
                    display: "block",
                  }}
                >
                  Password*
                </Typography>
                <TextField
                  id="password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  error={!!errors.password}
                  helperText={errors.password}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: "#9e9e9e" }}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "0.875rem",
                      "& fieldset": {
                        borderColor: "#d0d0d0",
                      },
                      "&:hover fieldset": {
                        borderColor: "#737373",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#212121",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "#d32f2f",
                      mx: 0,
                      mt: 0.5,
                    },
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  Email or password is wrong.
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.rememberMe}
                      onChange={(e) =>
                        handleFieldChange("rememberMe", e.target.checked)
                      }
                      size="small"
                      sx={{
                        color: "#9e9e9e",
                        "&.Mui-checked": {
                          color: "#212121",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#424242" }}>
                      Remember me
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  justifyContent: "end",
                }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isPending}
                  sx={{
                    bgcolor: "#525252",
                    color: "white",
                    width: 90,
                    height: 40,
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 1,
                    fontSize: "16px",
                    "&:hover": {
                      bgcolor: "#424242",
                    },
                    "&:disabled": {
                      bgcolor: "#e0e0e0",
                      color: "#9e9e9e",
                    },
                  }}
                >
                  {isPending ? (
                    <CircularProgress size={16} sx={{ color: "#9e9e9e" }} />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#757575" }}>
                  <Link
                    component="button"
                    onClick={() => router.push("/signup")}
                    sx={{
                      color: "#525252",
                      textDecoration: "none",
                      fontWeight: 500,
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Create account
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          borderTop: 1,
          borderColor: "#E5E5E5",
          bgcolor: "white",
          py: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          px: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#737373",
            display: "block",
            mb: 1,
            textAlign: "center",
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
          }}
        >
          © 2025 InvoiceApp. All rights reserved.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Privacy Policy
          </Link>
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Terms of Service
          </Link>
          <Link
            component="button"
            variant="caption"
            sx={{
              color: "#737373",
              textDecoration: "none",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              whiteSpace: "nowrap",
              "&:hover": { color: "#525252", textDecoration: "underline" },
            }}
          >
            Support
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
