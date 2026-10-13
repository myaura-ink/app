interface ProfileSeoInput {
  name: string | null;
  slug: string;
  publishedTitles: string[];
}

export const profile = ({ name, slug, publishedTitles }: ProfileSeoInput) => {
  const display = name ?? slug;
  const works =
    publishedTitles.length === 0
      ? "Follow along for their first story."
      : `Read ${publishedTitles.slice(0, 3).join(", ")}${publishedTitles.length > 3 ? " and more" : ""}.`;
  return {
    title: `${display} (@${slug})`,
    description: `${display} writes serialized fiction on Aura. ${works}`,
    keywords: [display, slug, "author", "writer profile", ...publishedTitles.slice(0, 5)],
  };
};
