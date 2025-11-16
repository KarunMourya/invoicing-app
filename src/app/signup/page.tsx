"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Box, Alert, Divider, Typography, LinearProgress } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuthStore } from "@/src/store/auth.store";
import { useAuthRedirect } from "@/src/hooks/useAuthRedirect";
import { signupService } from "@/src/services/auth.service";
import { LoadingScreen } from "@/src/components/common/LoadingScreen";
import { AuthLayout } from "@/src/components/auth/AuthLayout";
import { AuthCard } from "@/src/components/auth/AuthCard";
import { FormField } from "@/src/components/Form/FormField";
import { PasswordField } from "@/src/components/Form/PasswordField";
import { SubmitButton } from "@/src/components/Form/SubmitButton";
import { StickyButton } from "@/src/components/Form/StickyButton";
import { AuthLink } from "@/src/components/auth/AuthLink";

const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Please enter your first name.")
    .max(50, "First name must be max 50 characters."),
  lastName: z
    .string()
    .trim()
    .min(1, "Please enter your last name.")
    .max(50, "Last name must be max 50 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter a valid email address.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(20, "Password must be 8-20 characters.")
    .regex(
      /(?=.*[a-zA-Z])(?=.*\d)/,
      "Password must include letters and numbers."
    ),
  companyName: z
    .string()
    .trim()
    .min(1, "Please enter your company name.")
    .max(100, "Company name must be max 100 characters."),
  address: z
    .string()
    .trim()
    .min(1, "Please enter company address.")
    .max(500, "Address must be max 500 characters."),
  city: z
    .string()
    .trim()
    .min(1, "Please enter city.")
    .max(50, "City must be max 50 characters."),
  zip: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Zip must be exactly 6 digits."),
  industry: z
    .string()
    .trim()
    .max(50, "Industry must be max 50 characters.")
    .default(""),
  currencySymbol: z
    .string()
    .trim()
    .min(1, "Enter a valid currency symbol.")
    .max(5, "Currency symbol must be max 5 characters."),
});

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { checking } = useAuthRedirect();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    companyLogo: null as File | null,
    address: "",
    city: "",
    zip: "",
    industry: "",
    currencySymbol: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending, error } = useMutation({
    mutationFn: signupService,
    onSuccess: (res) => {
      login(res.token, res.user, res.company, true);
      router.push("/dashboard");
    },
  });

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(form);
      if (form.companyLogo && form.companyLogo.size > 5 * 1024 * 1024) {
        setErrors({ companyLogo: "Logo size must be less than 5MB." });
        return false;
      }
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
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        zipCode: form.zip.trim(),
        industry: form.industry.trim(),
        currencySymbol: form.currencySymbol.trim(),
        logo: form.companyLogo,
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setErrors({
        ...errors,
        companyLogo: "Invalid file type. Use PNG or JPG.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, companyLogo: "Logo size must be less than 5MB." });
      return;
    }

    setForm({ ...form, companyLogo: file });
    setErrors({ ...errors, companyLogo: "" });

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  if (checking) return <LoadingScreen />;

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Set up your company and start invoicing in minutes."
      showStickyButton
    >
      <AuthCard>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.response?.data || "Could not sign up. Try again."}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
          >
            <Typography sx={{ fontWeight: 400, color: "#212121" }}>
              User Information
            </Typography>
            <Divider />

            <FormField
              id="firstName"
              label="First Name"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={(val) => handleFieldChange("firstName", val)}
              error={errors.firstName}
              required
            />

            <FormField
              id="lastName"
              label="Last Name"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={(val) => handleFieldChange("lastName", val)}
              error={errors.lastName}
              required
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(val) => handleFieldChange("email", val)}
              error={errors.email}
              required
            />

            <Box>
              <PasswordField
                id="password"
                label="Password"
                placeholder="Enter password"
                value={form.password}
                onChange={(val) => handleFieldChange("password", val)}
                error={errors.password}
                required
              />
              {form.password && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          passwordStrength < 50
                            ? "#d32f2f"
                            : passwordStrength < 75
                            ? "#ff9800"
                            : "#4caf50",
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#757575" }}>
                    Password strength:{" "}
                    {passwordStrength < 50
                      ? "Weak"
                      : passwordStrength < 75
                      ? "Medium"
                      : "Strong"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
          >
            <Typography sx={{ fontWeight: 400, color: "#212121" }}>
              Company Information
            </Typography>
            <Divider />

            <FormField
              id="companyName"
              label="Company Name"
              placeholder="Enter company name"
              value={form.companyName}
              onChange={(val) => handleFieldChange("companyName", val)}
              error={errors.companyName}
              required
            />

            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#424242", mb: 1 }}
              >
                Company Logo
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 56,
                    borderRadius: 1,
                    border: "1px dashed #cfcfcf",
                    bgcolor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {logoPreview ? (
                    <NextImage
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <ImageIcon sx={{ color: "#9e9e9e", fontSize: 26 }} />
                  )}
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      border: "1px solid #d0d0d0",
                      borderRadius: "4px",
                      backgroundColor: "#fff",
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 1.2,
                      fontSize: "0.875rem",
                      color: "#424242",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#9e9e9e" },
                    }}
                    onClick={() =>
                      document.getElementById("companyLogoInput")?.click()
                    }
                  >
                    {form.companyLogo
                      ? form.companyLogo.name
                      : "No file chosen"}
                  </Box>
                  <input
                    id="companyLogoInput"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                  <Typography variant="caption" sx={{ color: "#757575" }}>
                    Max 2–5 MB
                  </Typography>
                </Box>
              </Box>
              {errors.companyLogo && (
                <Typography
                  variant="caption"
                  sx={{ color: "#d32f2f", mt: 0.5 }}
                >
                  {errors.companyLogo}
                </Typography>
              )}
            </Box>

            <FormField
              id="address"
              label="Address"
              placeholder="Enter company address"
              value={form.address}
              onChange={(val) => handleFieldChange("address", val)}
              error={errors.address}
              multiline
              rows={2}
              required
            />

            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Box sx={{ flex: 1 }}>
                <FormField
                  id="city"
                  label="City"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(val) => handleFieldChange("city", val)}
                  error={errors.city}
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormField
                  id="zip"
                  label="Zip Code"
                  placeholder="6 digits"
                  value={form.zip}
                  onChange={(val) =>
                    handleFieldChange("zip", val.replace(/\D/g, "").slice(0, 6))
                  }
                  error={errors.zip}
                  maxLength={6}
                  required
                />
              </Box>
            </Box>

            <FormField
              id="industry"
              label="Industry"
              placeholder="Industry type"
              value={form.industry}
              onChange={(val) => handleFieldChange("industry", val)}
              error={errors.industry}
            />

            <FormField
              id="currencySymbol"
              label="Currency Symbol"
              placeholder="$, ₹, €, AED"
              value={form.currencySymbol}
              onChange={(val) => handleFieldChange("currencySymbol", val)}
              error={errors.currencySymbol}
              maxLength={5}
              required
            />
          </Box>
        </Box>

        <Divider
          sx={{ mt: 3, display: { sm: "none", xs: "none", md: "block" } }}
        />

        <Box sx={{ display: { xs: "none", md: "block" }, mt: 3 }}>
          <SubmitButton onClick={handleSubmit} loading={isPending} endAligned>
            Sign Up
          </SubmitButton>
        </Box>

        <AuthLink
          text="Already have an account?"
          linkText="Login"
          href="/login"
        />
      </AuthCard>

      <StickyButton onClick={handleSubmit} loading={isPending}>
        Sign Up
      </StickyButton>
    </AuthLayout>
  );
}
