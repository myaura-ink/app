import { Box, Button } from "@mui/material";

// todo: manage auth state
export const AuthButton = () => {
  return (
    <Box>
      {/* login / sign up page */}
      <Button href="/dive" variant="outlined" size="small" sx={{ px: 2 }}>
        dive in
      </Button>
    </Box>
  );
};
