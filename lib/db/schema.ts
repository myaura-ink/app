import { index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

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
    roles: roleEnum("roles").array().notNull().default(["user"]),
    lastSignedInAt: timestamp("last_signed_in_at").defaultNow(),
    totalCreatives: integer("total_creatives").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("users_email_idx").on(t.email), index("users_slug_idx").on(t.slug)],
);

export const creatives = pgTable(
  "creatives",
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
    totalCountOfReadingListAdds: integer("total_count_of_reading_list_adds").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("creatives_author_id_idx").on(t.authorId),
    index("creatives_slug_idx").on(t.slug),
    index("creatives_published_idx").on(t.published),
  ],
);

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creativeId: uuid("creative_id")
      .notNull()
      .references(() => creatives.id),
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
  (t) => [
    index("chapters_creative_id_idx").on(t.creativeId),
    index("chapters_creative_id_order_idx").on(t.creativeId, t.order),
  ],
);

export const critiques = pgTable(
  "critiques",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creativeId: uuid("creative_id")
      .notNull()
      .references(() => creatives.id, { onDelete: "cascade" }),
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
  (t) => [
    index("critiques_creative_id_idx").on(t.creativeId),
    index("critiques_user_id_idx").on(t.userId),
  ],
);

export const readingList = pgTable(
  "reading_list",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creativeId: uuid("creative_id")
      .notNull()
      .references(() => creatives.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("reading_list_user_creative_unique").on(t.userId, t.creativeId),
    index("reading_list_user_id_idx").on(t.userId),
    index("reading_list_creative_id_idx").on(t.creativeId),
  ],
);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertCreative = typeof creatives.$inferInsert;
export type SelectCreative = typeof creatives.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;
export type SelectChapter = typeof chapters.$inferSelect;
export type SelectCreativeWithAuthor = Partial<SelectCreative> & {
  author: { id: string; slug: string; name: string | null };
};
export type InsertCritique = typeof critiques.$inferInsert;
export type SelectCritique = typeof critiques.$inferSelect;
export type InsertReadingList = typeof readingList.$inferInsert;
export type SelectReadingList = typeof readingList.$inferSelect;
