"use client";

import { Person } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useAuth } from "@/app/contexts";

// todo: manage auth state
export const AuthButton = () => {
  const { user } = useAuth();
  return (
    <Box>
      {/* login / sign up page */}
      {user ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small">
            <Person />
          </IconButton>
          <Typography variant="body2" sx={{ ml: 1 }}>
            {user?.user_metadata?.name || "atul"}
          </Typography>
        </Stack>
      ) : (
        <Button href="/dive" variant="outlined" size="small" sx={{ px: 2 }}>
          dive in
        </Button>
      )}
    </Box>
  );
};
