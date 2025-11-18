"use client";

import { useState } from "react";
import {
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuthStore } from "@/src/store/auth.store";
import { useAuthRedirect } from "@/src/hooks/useAuthRedirect";
import { loginService } from "@/src/services/auth.service";
import { LoadingScreen } from "@/src/components/common/LoadingScreen";
import { AuthLayout } from "@/src/components/auth/AuthLayout";
import { AuthCard } from "@/src/components/auth/AuthCard";
import { FormField } from "@/src/components/form/FormField";
import { PasswordField } from "@/src/components/form/PasswordField";
import { SubmitButton } from "@/src/components/form/SubmitButton";
import { AuthLink } from "@/src/components/auth/AuthLink";

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

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { checking } = useAuthRedirect();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginService,
    onSuccess: (res) => {
      login(res.token, res.user, res.company, form.rememberMe);
      router.push("/dashboard");
    },
  });

  const validateForm = (): boolean => {
    try {
      loginSchema.parse({ email: form.email, password: form.password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
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
    if (e.key === "Enter") handleSubmit();
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    if (typeof value === "string") setErrors({ ...errors, [field]: "" });
  };

  if (checking) return <LoadingScreen />;

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your account.">
      <AuthCard>
        <Box sx={{ mb: 2.5 }}>
          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(val) => handleFieldChange("email", val)}
            onKeyPress={handleKeyPress}
            error={errors.email}
            required
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <PasswordField
            id="password"
            label="Password"
            placeholder="Enter password"
            value={form.password}
            onChange={(val) => handleFieldChange("password", val)}
            onKeyPress={handleKeyPress}
            error={errors.password}
            required
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
                  "&.Mui-checked": { color: "#212121" },
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

        <Box sx={{ mb: 2 }}>
          <SubmitButton
            onClick={handleSubmit}
            disabled={!form.email || !form.password}
            loading={isPending}
            endAligned
          >
            Login
          </SubmitButton>
        </Box>

        <AuthLink text="" linkText="Create account" href="/signup" />
      </AuthCard>
    </AuthLayout>
  );
}
