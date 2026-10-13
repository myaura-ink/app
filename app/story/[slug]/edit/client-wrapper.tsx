"use client";

import { useRouter } from "next/navigation";
import { StoryForm, type StoryFormValues } from "@/app/components";
import { useUpdateStory } from "@/app/hooks/useStories";

interface Props {
  slug: string;
  initialValues: StoryFormValues;
}

export const EditStoryClient = ({ slug, initialValues }: Props) => {
  const router = useRouter();
  const updateStory = useUpdateStory(slug);

  return (
    <StoryForm
      initialValues={initialValues}
      submitLabel="Save changes"
      pendingLabel="Saving..."
      isPending={updateStory.isPending}
      error={updateStory.isError ? updateStory.error.message : undefined}
      onSubmit={(values) => updateStory.mutate(values, { onSuccess: () => router.push(`/story/${slug}`) })}
      onCancel={() => router.push(`/story/${slug}`)}
    />
  );
};
