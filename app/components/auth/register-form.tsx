"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useSupabase } from "@/app/hooks/useSupabase";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const RegisterForm = () => {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = formData;
      console.log("Registering account...");
      console.log(data);
      const user = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });
      console.log(user.data.session);

      if (user.error) {
        throw user.error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      console.log(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "primary.main",
          }}
        >
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
            label="Full Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
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
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
