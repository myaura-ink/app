import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { config } from "@/app/config";

export const Footer = () => {
  return (
    <Box component="footer" className="pt-20 pb-10 space-y-20">
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2}>
          <Typography color="text.secondary">
            built with ❤️ by{" "}
            <Link href={config.socials.twitter} target="_blank" rel="noopener noreferrer">
              atul
            </Link>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            | &copy; {new Date().getFullYear()}{" "}
            <Link href={config.platform} target="_blank" rel="noopener noreferrer">
              aura
            </Link>
            , all rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
