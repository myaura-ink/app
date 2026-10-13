"use client";

import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";

type Mode = "system" | "light" | "dark";

const options: { value: Mode; label: string; Icon: typeof LightModeOutlined }[] = [
  { value: "system", label: "System", Icon: SettingsBrightnessOutlined },
  { value: "light", label: "Light", Icon: LightModeOutlined },
  { value: "dark", label: "Dark", Icon: DarkModeOutlined },
];

export const ThemeToggle = () => {
  // mode is undefined until mounted, so nothing is selected on the server render
  const { mode, setMode } = useColorScheme();

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={mode ?? null}
      onChange={(_, value: Mode | null) => value && setMode(value)}
      aria-label="Color theme"
      sx={{ "& .MuiToggleButton-root": { px: 1, py: 0.5, border: 0 }, bgcolor: "action.hover", borderRadius: 2 }}
    >
      {options.map(({ value, label, Icon }) => (
        <Tooltip key={value} title={label}>
          <ToggleButton value={value} aria-label={label}>
            <Icon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};
