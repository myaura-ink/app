"use client";

import { Person } from "@mui/icons-material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/contexts";

export const AuthButton = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePortfolio = () => {
    handleClose();
    router.push("/portfolio");
  };

  const handleLogout = async () => {
    handleClose();
    await signOut();
  };

  return (
    <Box>
      {user ? (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            onClick={handleOpen}
            sx={{ cursor: "pointer" }}
          >
            <IconButton size="small">
              <Person />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              {user?.user_metadata?.name || "atul"}
            </Typography>
          </Stack>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handlePortfolio}>
              <ListItemIcon>
                <AccountCircleOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Portfolio</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button href="/dive" variant="outlined" size="small" sx={{ px: 2 }}>
          dive in
        </Button>
      )}
    </Box>
  );
};
