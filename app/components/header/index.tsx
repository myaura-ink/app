import { AppBar, Container, Link, Stack, Toolbar, Typography } from "@mui/material";
import { AuthButton } from "../auth-button";

export const Header = () => {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      variant="elevation"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar>
        <Container maxWidth={"lg"}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Brand />
            <AuthButton />
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

const Brand = () => {
  return (
    <Link href="/" sx={{ textDecoration: "none" }}>
      <Typography
        component="span"
        variant="h6"
        color="primary.main"
        fontWeight={700}
        sx={{ letterSpacing: "-0.02em", opacity: 1, transition: "opacity 0.15s", ":hover": { opacity: 0.7 } }}
      >
        <Typography component="span" variant="h5" color="primary.main" fontWeight={800}>a</Typography>ura
      </Typography>
    </Link>
  );
};
