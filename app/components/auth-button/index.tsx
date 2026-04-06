"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { useAuth } from "@/app/hooks/useAuth";

export const AuthButton = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePortfolio = () => {
    handleClose();
    router.push(`/portfolio/${user!.slug}`);
  };

  const handleLogout = () => {
    handleClose();
    signOut();
  };

  return (
    <Box>
      {user ? (
        <>
          <Stack direction="row" alignItems="center" gap={1} onClick={handleOpen} sx={{ cursor: "pointer" }}>
            <Box sx={{ borderRadius: "50%", overflow: "hidden", width: 30, height: 30, flexShrink: 0 }}>
              <Avatar slug={user.slug} size={30} />
            </Box>
            <Typography variant="body2">
              {user.name ?? user.email}
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
