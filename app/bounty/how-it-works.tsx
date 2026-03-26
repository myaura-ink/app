"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

const STEPS = [
  {
    number: "01",
    title: "Describe the story you want to read",
    description:
      "Give your request a title, write a description, pick a genre, and add any details that bring your vision to life — a tone, a setting, a feeling you're chasing. You don't need a complete brief. A single vivid sentence is enough to start something.",
  },
  {
    number: "02",
    title: "Make a contribution",
    description:
      "Back the bounty with any amount you choose. Your pledge signals to writers that real demand exists. The more a bounty accumulates, the harder it is to ignore — and funds are only collected when a writer formally accepts the request.",
  },
  {
    number: "03",
    title: "Share it with people who care",
    description:
      "Send the bounty to readers, communities, and corners of the internet where the right people might find it. Every new backer raises the signal. A story that many people want, and are willing to pay for, is a story that gets written.",
  },
];

export const HowItWorks = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" size="large" onClick={() => setOpen(true)}>
        How It Works
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "background.paper",
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ px: 4, pt: 4, pb: 0 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack gap={0.5}>
              <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
                How It Works
              </Typography>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                From idea to story
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ mt: -0.5, mr: -1, color: "text.secondary" }}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 4 }}>
          <Stack gap={0} divider={<Divider />}>
            {STEPS.map((step) => (
              <Stack key={step.number} direction="row" gap={3} sx={{ py: 3 }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="secondary.light"
                  sx={{ lineHeight: 1, flexShrink: 0, mt: 0.25 }}
                >
                  {step.number}
                </Typography>
                <Stack gap={0.75}>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                    {step.description}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>

          <Box sx={{ mt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setOpen(false)}
            >
              Got it — let me make a request
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
