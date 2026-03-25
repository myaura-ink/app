import { Avatar, Box, Container, Stack, Tab, Tabs, Typography } from "@mui/material";

export default function Portfolio() {
  return (
    <Box component="main" sx={{ py: 10, backgroundColor: "white" }}>
      <Container maxWidth="md">
        <Stack direction="column" gap={2} justifyContent={"center"} alignItems={"center"}>
          <Avatar>AP</Avatar>
          <Box>
            <Typography>Author Name</Typography>
            <Typography variant="caption">@author_name</Typography>
          </Box>
          <Stack direction={"row"} gap={2}>
            <Stack direction={"column"} gap={1} alignItems={"center"}>
              <Typography>Works</Typography>
              <Typography>2</Typography>
            </Stack>
            <Stack direction={"column"} gap={1} alignItems={"center"}>
              <Typography>Reading List</Typography>
              <Typography>10</Typography>
            </Stack>
            <Stack direction={"column"} gap={1} alignItems={"center"}>
              <Typography>Followers</Typography>
              <Typography>100k</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Tabs value={0} centered>
          <Tab label="Works" />
          <Tab label="Reading List" />
          <Tab label="About" />
        </Tabs>
      </Container>
    </Box>
  );
}
