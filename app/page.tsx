import { Box } from "@mui/material";
import { Footer, Hero, Mission } from "./components";

export default function Home() {
  return (
    <Box component="main">
      <Hero />
      <Mission />
      <Footer />
    </Box>
  );
}
