import { Box } from "@mui/material";

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

export const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return value === index ? <Box sx={{ mt: 3, pb: 6 }}>{children}</Box> : null;
};
