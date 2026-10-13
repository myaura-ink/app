import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["admin", "super_admin", "user", "writer"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name"),
    slug: text("slug").notNull().unique(),
    image: text("image"),
    roles: roleEnum("roles").array().notNull().default(["user", "writer"]),
    lastSignedInAt: timestamp("last_signed_in_at").defaultNow(),
    totalStories: integer("total_stories").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("users_email_idx").on(t.email), index("users_slug_idx").on(t.slug)],
);

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    coverImage: text("cover_image"),
    genre: text("genre"),
    // 0 = draft, 1 = published
    published: integer("published").notNull().default(0),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    totalChapters: integer("total_chapters").notNull().default(0),
    totalCritiques: integer("total_critiques").notNull().default(0),
    totalCountOfLibraryAdds: integer("total_count_of_library_adds").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("stories_author_id_idx").on(t.authorId),
    index("stories_slug_idx").on(t.slug),
    index("stories_published_idx").on(t.published),
  ],
);

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content"),
    order: integer("order").notNull(),
    // 0 = draft, 1 = published
    published: integer("published").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("chapters_story_id_idx").on(t.storyId), index("chapters_story_id_order_idx").on(t.storyId, t.order)],
);

export const critiques = pgTable(
  "critiques",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("critiques_story_id_idx").on(t.storyId), index("critiques_user_id_idx").on(t.userId)],
);

export const library = pgTable(
  "library",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("library_user_story_unique").on(t.userId, t.storyId),
    index("library_user_id_idx").on(t.userId),
    index("library_story_id_idx").on(t.storyId),
  ],
);

// tags are normalized (lowercase, single-spaced) and shared across stories
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storyTags = pgTable(
  "story_tags",
  {
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.storyId, t.tagId] }), index("story_tags_tag_id_idx").on(t.tagId)],
);

// where each reader left off: one row per user and story, moved forward as they read
export const readingHistory = pgTable(
  "reading_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    // null once the chapter is deleted; the story stays in the history
    chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => [
    unique("reading_history_user_story_unique").on(t.userId, t.storyId),
    index("reading_history_user_id_read_at_idx").on(t.userId, t.readAt),
  ],
);

// every chapter a reader has opened, for read marks in chapter lists
export const chapterReads = pgTable(
  "chapter_reads",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    // kept alongside the chapter so a story's reads can be cleared with its history entry
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.chapterId] }),
    index("chapter_reads_user_id_story_id_idx").on(t.userId, t.storyId),
  ],
);

// queries a reader committed to (enter, or opening a result), latest casing kept for display
export const searchHistory = pgTable(
  "search_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    // lowercased query, so "Lamplighter" and "lamplighter" are one entry
    queryKey: text("query_key").notNull(),
    searchedAt: timestamp("searched_at").notNull().defaultNow(),
  },
  (t) => [
    unique("search_history_user_query_unique").on(t.userId, t.queryKey),
    index("search_history_user_id_searched_at_idx").on(t.userId, t.searchedAt),
  ],
);

// how a user feels about aura itself: one row per user, used to gauge interest before building paid support
export const projectSupport = pgTable("project_support", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  liked: boolean("liked").notNull().default(false),
  // monthly amount in usd they say they'd pay; null = not answered, 0 = not willing
  pledge: integer("pledge"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;
export type SelectStory = typeof stories.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;
export type SelectChapter = typeof chapters.$inferSelect;
export type SelectStoryWithAuthor = Partial<SelectStory> & {
  author: { id: string; slug: string; name: string | null };
};
export type InsertCritique = typeof critiques.$inferInsert;
export type SelectCritique = typeof critiques.$inferSelect;
export type InsertLibrary = typeof library.$inferInsert;
export type SelectLibrary = typeof library.$inferSelect;
export type SelectTag = typeof tags.$inferSelect;
export type SelectReadingHistory = typeof readingHistory.$inferSelect;
export type SelectSearchHistory = typeof searchHistory.$inferSelect;
export type SelectProjectSupport = typeof projectSupport.$inferSelect;
