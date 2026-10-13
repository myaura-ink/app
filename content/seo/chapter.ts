interface ChapterSeoInput {
  title: string;
  order: number;
  excerpt: string;
  storyTitle: string;
  authorName: string | null;
  genre: string | null;
  tags: string[];
}

export const chapter = ({ title, order, excerpt, storyTitle, authorName, genre, tags }: ChapterSeoInput) => {
  const author = authorName ?? "an Aura author";
  return {
    title: `${title} - ${storyTitle}`,
    description: excerpt || `Read chapter ${order} of ${storyTitle} by ${author} on Aura.`,
    keywords: [storyTitle, title, author, ...(genre ? [genre] : []), ...tags],
  };
};
