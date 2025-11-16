"use client";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Alert,
  LinearProgress,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";
import { signupService } from "../../services/auth.service";
import { z } from "zod";
import { getToken } from "@/src/lib/tokens";
import { isTokenValid } from "@/src/lib/authGuard";

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

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  companyLogo: File | null;
  address: string;
  city: string;
  zip: string;
  industry: string;
  currencySymbol: string;
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    companyLogo: null,
    address: "",
    city: "",
    zip: "",
    industry: "",
    currencySymbol: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(true);

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);

  const validateForm = (): boolean => {
    try {
      signupSchema.parse({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        address: form.address,
        city: form.city,
        zip: form.zip,
        industry: form.industry,
        currencySymbol: form.currencySymbol,
      });

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
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: signupService,
    onSuccess: (res) => {
      login(res.token, res.user, res.company, true);
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

  const handleSubmit = () => {
    if (validateForm()) {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || "",
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        zipCode: form.zip.trim(),
        industry: form.industry?.trim() || "",
        currencySymbol: form.currencySymbol.trim(),
        logo: form.companyLogo,
      };

      mutate(payload);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setErrors({
          ...errors,
          companyLogo: "Invalid file type. Use PNG or JPG.",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          companyLogo: "Logo size must be less than 5MB.",
        });
        return;
      }
      setForm({ ...form, companyLogo: file });
      setErrors({ ...errors, companyLogo: "" });

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (
    field: keyof SignupForm,
    value: string | File | null
  ) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

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
          borderBottom: "1px solid #e5e5e5",
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
          justifyContent: "center",
          py: { xs: 2, md: 6 },
          px: 2,
          pb: { xs: 10, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 900 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 200, mb: 0.5, color: "#212121" }}
            >
              Create Your Account
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              Set up your company and start invoicing in minutes.
            </Typography>
          </Box>

          <Card
            sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
            elevation={0}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error?.response?.data || "Could not sign up. Try again."}
                </Alert>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "column",
                    md: "row",
                  },
                  gap: {
                    xs: 3,
                    sm: 2,
                    md: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 400, color: "#212121" }}>
                    User Information
                  </Typography>

                  <Divider />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="firstName"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      First Name*
                    </Typography>
                    <TextField
                      id="firstName"
                      fullWidth
                      placeholder="Enter first name"
                      value={form.firstName}
                      onChange={(e) =>
                        handleFieldChange("firstName", e.target.value)
                      }
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="lastName"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Last Name*
                    </Typography>
                    <TextField
                      id="lastName"
                      fullWidth
                      placeholder="Enter last name"
                      value={form.lastName}
                      onChange={(e) =>
                        handleFieldChange("lastName", e.target.value)
                      }
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="email"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Email*
                    </Typography>
                    <TextField
                      id="email"
                      fullWidth
                      type="email"
                      placeholder="Enter email"
                      value={form.email}
                      onChange={(e) =>
                        handleFieldChange("email", e.target.value)
                      }
                      error={!!errors.email}
                      helperText={errors.email}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="password"
                      variant="body2"
                      sx={{
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
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                    {form.password && (
                      <Box>
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 400, color: "#212121" }}>
                    Company Information
                  </Typography>

                  <Divider />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="companyName"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Company Name*
                    </Typography>
                    <TextField
                      id="companyName"
                      fullWidth
                      placeholder="Enter company name"
                      value={form.companyName}
                      onChange={(e) =>
                        handleFieldChange("companyName", e.target.value)
                      }
                      error={!!errors.companyName}
                      helperText={errors.companyName}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Company Logo
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {/* LEFT PREVIEW BOX */}
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
                            style={{
                              objectFit: "contain",
                            }}
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
                            width: "100%",
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: 1.2,
                            fontSize: "0.875rem",
                            color: "#424242",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "#9e9e9e",
                            },
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
                      <Typography variant="caption" sx={{ color: "#d32f2f" }}>
                        {errors.companyLogo}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="address"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Address*
                    </Typography>
                    <TextField
                      id="address"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Enter company address"
                      value={form.address}
                      onChange={(e) =>
                        handleFieldChange("address", e.target.value)
                      }
                      error={!!errors.address}
                      helperText={errors.address}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <Typography
                        component="label"
                        htmlFor="city"
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#424242",
                          display: "block",
                        }}
                      >
                        City*
                      </Typography>
                      <TextField
                        id="city"
                        fullWidth
                        placeholder="Enter city"
                        value={form.city}
                        onChange={(e) =>
                          handleFieldChange("city", e.target.value)
                        }
                        error={!!errors.city}
                        helperText={errors.city}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: "0.875rem",
                          },
                          "& .MuiFormHelperText-root": {
                            color: "#d32f2f",
                            mx: 0,
                            mt: 0.5,
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <Typography
                        component="label"
                        htmlFor="zip"
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#424242",
                          display: "block",
                        }}
                      >
                        Zip Code*
                      </Typography>
                      <TextField
                        id="zip"
                        fullWidth
                        placeholder="6 digits zip code"
                        value={form.zip}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          handleFieldChange("zip", value);
                        }}
                        error={!!errors.zip}
                        helperText={errors.zip}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: "0.875rem",
                          },
                          "& .MuiFormHelperText-root": {
                            color: "#d32f2f",
                            mx: 0,
                            mt: 0.5,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="industry"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Industry
                    </Typography>
                    <TextField
                      id="industry"
                      fullWidth
                      placeholder="Industry type"
                      value={form.industry}
                      onChange={(e) =>
                        handleFieldChange("industry", e.target.value)
                      }
                      error={!!errors.industry}
                      helperText={errors.industry}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      component="label"
                      htmlFor="currencySymbol"
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#424242",
                        display: "block",
                      }}
                    >
                      Currency Symbol*
                    </Typography>
                    <TextField
                      id="currencySymbol"
                      fullWidth
                      placeholder="$, ₹, €, AED"
                      value={form.currencySymbol}
                      onChange={(e) =>
                        handleFieldChange(
                          "currencySymbol",
                          e.target.value.slice(0, 5)
                        )
                      }
                      error={!!errors.currencySymbol}
                      helperText={errors.currencySymbol}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiFormHelperText-root": {
                          color: "#d32f2f",
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ marginTop: 3 }} />

              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <Button
                  disabled={isPending}
                  onClick={handleSubmit}
                  sx={{
                    bgcolor: "#525252",
                    color: "white",
                    px: 4,
                    height: 42,
                    textTransform: "none",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "#424242" },
                    "&:disabled": {
                      bgcolor: "#e0e0e0",
                      color: "#9e9e9e",
                    },
                  }}
                >
                  {isPending ? (
                    <CircularProgress size={16} sx={{ color: "#9e9e9e" }} />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </Box>

              {/* Login Link */}
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography sx={{ color: "#757575", fontSize: 14 }}>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    onClick={() => router.push("/login")}
                    sx={{
                      color: "#525252",
                      fontWeight: 500,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Login
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "white",
          borderTop: "1px solid #e5e5e5",
          p: 2,
          zIndex: 1000,
        }}
      >
        <Button
          disabled={isPending}
          onClick={handleSubmit}
          fullWidth
          sx={{
            bgcolor: "#525252",
            color: "white",
            height: 48,
            textTransform: "none",
            borderRadius: 1,
            fontSize: "16px",
            fontWeight: 500,
            "&:hover": { bgcolor: "#424242" },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
        >
          {isPending ? (
            <CircularProgress size={20} sx={{ color: "#9e9e9e" }} />
          ) : (
            "Sign Up"
          )}
        </Button>
      </Box>

      <Box
        sx={{
          borderTop: "1px solid #e5e5e5",
          py: 3,
          bgcolor: "white",
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "#737373", fontSize: 12 }}>
          © 2025 InvoiceApp. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
