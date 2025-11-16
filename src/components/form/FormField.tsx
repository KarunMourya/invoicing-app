import { Box, TextField, Typography } from "@mui/material";
import { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  endAdornment?: ReactNode;
  maxLength?: number;
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyPress,
  error,
  required = false,
  multiline = false,
  rows,
  endAdornment,
  maxLength,
}: FormFieldProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#424242",
          display: "block",
        }}
      >
        {label}
        {required && "*"}
      </Typography>
      <TextField
        id={id}
        fullWidth
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = maxLength
            ? e.target.value.slice(0, maxLength)
            : e.target.value;
          onChange(val);
        }}
        onKeyPress={onKeyPress}
        error={!!error}
        helperText={error}
        multiline={multiline}
        rows={rows}
        size="small"
        InputProps={
          endAdornment
            ? {
                endAdornment,
              }
            : undefined
        }
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
  );
}
