"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { useAuth } from "@/app/hooks/useAuth";

export const AuthButton = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleClose();
    router.push(`/profile/${user!.slug}`);
  };

  const handleLogout = () => {
    handleClose();
    logout.mutate();
  };

  return (
    <Box>
      {user ? (
        <>
          <ButtonBase
            onClick={handleOpen}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={Boolean(anchorEl)}
            sx={{
              gap: 0.75,
              p: 0.375,
              pr: { xs: 0.375, sm: 1 },
              borderRadius: 999,
              border: "1px solid",
              borderColor: "divider",
              transition: "background-color 0.15s, border-color 0.15s",
              "&:hover": { bgcolor: "action.hover", borderColor: "text.disabled" },
            }}
          >
            <Box sx={{ borderRadius: "50%", overflow: "hidden", width: 28, height: 28, flexShrink: 0 }}>
              <Avatar slug={user.slug} size={28} />
            </Box>
            <Typography
              variant="body2"
              noWrap
              sx={{ display: { xs: "none", sm: "block" }, maxWidth: 120, fontWeight: 600 }}
            >
              {user.name ?? user.email}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                display: { xs: "none", sm: "block" },
                fontSize: 18,
                color: "text.secondary",
                transition: "transform 0.15s",
                transform: anchorEl ? "rotate(180deg)" : "none",
              }}
            />
          </ButtonBase>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2 } } }}
          >
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                {user.name ?? user.slug}
              </Typography>
              <Typography variant="caption" noWrap component="p" sx={{ color: "text.secondary" }}>
                {user.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={NextLink} href="/write" onClick={handleClose}>
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Write a story</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircleOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem component={NextLink} href="/history" onClick={handleClose}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>History</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          component={NextLink}
          href="/dive"
          variant="contained"
          size="small"
          disableElevation
          sx={{ px: 2.25, borderRadius: 999 }}
        >
          Dive in
        </Button>
      )}
    </Box>
  );
};
