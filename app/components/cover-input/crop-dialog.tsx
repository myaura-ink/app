"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { COVER_ASPECT, type CropArea } from "./compress";

interface CropDialogProps {
  file: File | null;
  onCancel: () => void;
  onConfirm: (area: CropArea) => void;
}

export const CropDialog = ({ file, onCancel, onConfirm }: CropDialogProps) => {
  const [src, setSrc] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  // fresh crop for every file, and release the object url once it's no longer shown
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Dialog open={!!file} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Crop your cover</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Covers are 5:7 portrait. Drag to reposition and zoom to frame the part you want.
        </Typography>
        <Box
          sx={{
            position: "relative",
            height: { xs: 360, sm: 420 },
            bgcolor: "grey.900",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={COVER_ASPECT}
              // fill the box so the crop frame is as large as it can be, whatever the image's shape
              objectFit="cover"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </Box>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, mt: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.01}
            onChange={(_, value) => setZoom(value as number)}
            aria-label="Zoom"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={() => area && onConfirm(area)} disabled={!area}>
          Use this crop
        </Button>
      </DialogActions>
    </Dialog>
  );
};
