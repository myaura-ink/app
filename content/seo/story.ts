import { home } from "./home";

interface StorySeoInput {
  title: string;
  description: string | null;
  genre: string | null;
  authorName: string | null;
  tags: string[];
  totalChapters: number;
}

export const story = ({ title, description, genre, authorName, tags, totalChapters }: StorySeoInput) => {
  const author = authorName ?? "an Aura author";
  const chapters = totalChapters === 1 ? "1 chapter" : `${totalChapters} chapters`;
  return {
    title: `${title} by ${author}`,
    // the synopsis is the best snippet; fall back to a generated line for works without one
    description:
      description ||
      `Read ${title}, ${genre ? `a ${genre.toLowerCase()} story` : "a story"} by ${author} on Aura. ${chapters} so far.`,
    keywords: [title, author, ...(genre ? [genre] : []), ...tags, ...home.keywords.slice(1, 4)],
  };
};
