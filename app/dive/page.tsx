"use client";

import { Box, Container, Paper, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { LoginForm, RegisterForm } from "../components";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Dive() {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Tab Navigation */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="authentication tabs"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
            centered
          >
            <Tab
              label="Sign In"
              id="auth-tab-0"
              aria-controls="auth-tabpanel-0"
              sx={{ fontWeight: tabValue === 0 ? 600 : 500 }}
            />
            <Tab
              label="Create Account"
              id="auth-tab-1"
              aria-controls="auth-tabpanel-1"
              sx={{ fontWeight: tabValue === 1 ? 600 : 500 }}
            />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {/* Login Form */}
            <TabPanel value={tabValue} index={0}>
              <LoginForm />
            </TabPanel>

            {/* Register Form */}
            <TabPanel value={tabValue} index={1}>
              <RegisterForm />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
