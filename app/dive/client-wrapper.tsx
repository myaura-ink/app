"use client";

import { Box, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { LoginForm, RegisterForm } from "../components";

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box>{children}</Box> : null;
}

export const DivePageClient = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 8 },
        py: 6,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* Mobile brand */}
        <Box sx={{ display: { xs: "block", md: "none" }, mb: 6, textAlign: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              <Typography component="span" variant="h4" fontWeight={800} color="primary.main">
                a
              </Typography>
              ura
            </Typography>
          </Link>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 4, "& .MuiTabs-indicator": { height: 3 } }}>
          <Tab label="Sign in" sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }} />
          <Tab label="Create account" sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <LoginForm />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <RegisterForm />
        </TabPanel>
      </Box>
    </Box>
  );
};
