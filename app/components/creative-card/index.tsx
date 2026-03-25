import { Card, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";

export interface CreativeCardProps {
  title: string;
  author: string;
  genre: string;
  cover: string;
  description?: string;
}

export function CreativeCard({ title, author, genre, cover, description }: CreativeCardProps) {
  return (
    <Card sx={{ display: "flex", gap: 2, p: 2, boxShadow: 0, border: "1px solid", borderColor: "divider" }}>
      <CardMedia
        component="img"
        sx={{ width: 72, height: 108, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
        image={cover}
        alt={title}
      />
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flex: 1 }}>
        <Stack gap={0.5}>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            by {author}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
          <Chip label={genre} size="small" sx={{ mt: 0.5, alignSelf: "flex-start" }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
