import { AppBar, Box, Container, Link, Stack, Toolbar, Typography } from "@mui/material";
import { AuthButton } from "../auth-button";

export const Header = () => {
  return (
    <Box component="header">
      <AppBar color="inherit" variant="outlined" sx={{ borderRadius: 1 }}>
        <Toolbar>
          <Container maxWidth={"lg"}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Brand />
              <AuthButton />
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const Brand = () => {
  return (
    <Link href="/" sx={{ textDecoration: "none" }}>
      <Typography
        component="span"
        variant="h6"
        color="text.secondary"
        fontWeight={600}
        sx={{ ":hover": { fontWeight: 800 } }}
      >
        <Typography component="span" variant="h4" color="primary.main" fontWeight={800}>
          a
        </Typography>
        ura
      </Typography>
    </Link>
  );
};
