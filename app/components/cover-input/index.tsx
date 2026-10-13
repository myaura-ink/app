"use client";

import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { useAuthContext } from "@/app/contexts";
import { COVER_INPUT_TYPES, MAX_COVER_INPUT_BYTES } from "@/lib/utils/cover";
import { type CropArea, compressCover, needsCrop } from "./compress";
import { CropDialog } from "./crop-dialog";

// matches the story cards so the preview crops the same way readers will see it
const COVER_RATIO = "5 / 7";

interface CoverInputProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

// uploads straight from the browser to Vercel Blob; /api/upload only signs the request
export const CoverInput = ({ value, onChange, onUploadingChange, disabled }: CoverInputProps) => {
  const { user, token } = useAuthContext();
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [cropping, setCropping] = useState<File | null>(null);
  const uploading = progress !== null;

  const setUploading = (next: number | null) => {
    setProgress(next);
    onUploadingChange?.(next !== null);
  };

  const uploadCover = async (file: File, area?: CropArea) => {
    if (!user || !token) return;
    setUploading(0);
    try {
      const cover = await compressCover(file, area);
      const blob = await upload(`covers/${user.id}/${cover.name}`, cover, {
        access: "public",
        handleUploadUrl: "/api/upload",
        headers: { Authorization: `Bearer ${token}` },
        contentType: cover.type,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onChange(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(null);
    }
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset so picking the same file again still fires onChange
    e.target.value = "";
    if (!file || !user || !token) return;

    if (!COVER_INPUT_TYPES.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_COVER_INPUT_BYTES) {
      setError(`Keep it under ${MAX_COVER_INPUT_BYTES / 1024 / 1024} MB.`);
      return;
    }

    setError("");
    try {
      // already 5:7? upload as is; otherwise let the author pick the framing
      if (await needsCrop(file)) setCropping(file);
      else await uploadCover(file);
    } catch {
      setError("Couldn't read that image. Try a different file.");
    }
  };

  return (
    <Stack direction="row" sx={{ gap: 2.5, alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 100,
          aspectRatio: COVER_RATIO,
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value ? (
          <Image src={value} alt="Cover preview" fill sizes="100px" style={{ objectFit: "cover" }} />
        ) : (
          <Stack sx={{ alignItems: "center", gap: 0.5, color: "text.disabled" }}>
            <ImageOutlinedIcon sx={{ fontSize: 32 }} />
            <Typography variant="caption">5:7</Typography>
          </Stack>
        )}
      </Box>

      <Stack sx={{ gap: 1, flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Cover image{" "}
          <Typography component="span" variant="caption" sx={{ color: "text.secondary", fontWeight: 400 }}>
            · 5:7 portrait, e.g. 1000 × 1400 px
          </Typography>
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Other shapes can be cropped after picking. JPEG, PNG, WebP or AVIF, up to{" "}
          {MAX_COVER_INPUT_BYTES / 1024 / 1024} MB.
        </Typography>

        <Stack direction="row" sx={{ gap: 1, pt: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fileInput.current?.click()}
            disabled={disabled || uploading}
          >
            {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button size="small" color="inherit" onClick={() => onChange("")} disabled={disabled || uploading}>
              Remove
            </Button>
          )}
        </Stack>

        {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5 }} />}
        {error && (
          <Typography variant="body2" sx={{ color: "error.main" }}>
            {error}
          </Typography>
        )}

        <CropDialog
          file={cropping}
          onCancel={() => setCropping(null)}
          onConfirm={(area) => {
            const file = cropping;
            setCropping(null);
            if (file) uploadCover(file, area);
          }}
        />
        <input ref={fileInput} type="file" accept={COVER_INPUT_TYPES.join(",")} hidden onChange={handleFile} />
      </Stack>
    </Stack>
  );
};
