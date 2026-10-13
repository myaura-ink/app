export const write = {
  title: "Start a new story",
  description: "Create a new story on Aura and publish it chapter by chapter.",
};

export const editStory = ({ title }: { title: string }) => ({
  title: `Edit “${title}”`,
  description: `Update the details of ${title} on Aura.`,
});
