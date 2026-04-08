"use client";

import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const COMMANDS = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  commands.heading,
  commands.divider,
  commands.quote,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.divider,
  commands.link,
];

// const EXTRA_COMMANDS = [];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const FONT = "var(--font-google-sans-flex, 'Google Sans Flex', Arial, sans-serif)";

export default function MdEditorInner({ value, onChange }: Props) {
  return (
    <MDEditor
      value={value}
      onChange={(val) => onChange(val ?? "")}
      preview="edit"
      visibleDragbar={false}
      commands={COMMANDS}
      style={{ minHeight: "60vh", fontSize: "1.0625rem", fontFamily: FONT }}
    />
  );
}
