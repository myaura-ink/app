export const browse = {
  title: "Browse stories",
  description:
    "Discover serialized fiction on Aura. Search stories by title, author or tag, from fantasy and romance to literary and climate fiction.",
  keywords: ["browse stories", "serialized fiction", "web novels", "online stories", "read fiction online"],
};

// a filtered search is a variation of /search, so it shares the canonical url but gets a more specific title
export const browseResults = ({ query, tags }: { query: string; tags: string[] }) => {
  const parts = [query && `“${query}”`, tags.length > 0 && tags.map((t) => `#${t}`).join(" ")].filter(Boolean);
  return parts.length > 0 ? { ...browse, title: `${parts.join(" ")} - Browse stories` } : browse;
};
