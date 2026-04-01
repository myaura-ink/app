"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const RegisterForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    register.mutate(formData);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join us to get started
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Username"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="john-doe"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            variant="outlined"
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={register.isPending}
            sx={{ mt: 2, py: 1.5, fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          >
            {register.isPending ? "Creating Account..." : "Register"}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
