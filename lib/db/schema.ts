import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertCreative = typeof creatives.$inferInsert;
export type SelectCreative = typeof creatives.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;
export type SelectChapter = typeof chapters.$inferSelect;
