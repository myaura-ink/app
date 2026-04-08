import { FullPageEditor } from "@/app/components";
import { useCreateChapter } from "@/app/hooks/useCreatives";
import { SelectChapter } from "@/lib";

export const ChapterCreate = ({
  slug,
  open,
  onSaved,
  onCancel,
}: {
  slug: string;
  open: boolean;
  onSaved: (ch: SelectChapter) => void;
  onCancel: () => void;
}) => {
  const createChapter = useCreateChapter(slug);

  return (
    <FullPageEditor
      open={open}
      mode="create"
      isSaving={createChapter.isPending}
      error={createChapter.isError ? createChapter.error.message : null}
      onCancel={onCancel}
      onSave={({ title, content, published }) => {
        createChapter.mutate(
          { title, content, published: published ?? false },
          { onSuccess: (ch) => onSaved(ch as unknown as SelectChapter) },
        );
      }}
    />
  );
};
