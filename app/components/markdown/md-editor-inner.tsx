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

export default function MdEditorInner({ value, onChange }: Props) {
  return (
    <MDEditor
      textareaProps={{
        id: "editor",
        name: "editor",
      }}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      preview="edit"
      visibleDragbar={false}
      commands={COMMANDS}
      style={{ minHeight: "70vh" }}
    />
  );
}
