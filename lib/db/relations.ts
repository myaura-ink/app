import { relations } from "drizzle-orm/relations";
import { chapters, creatives, critiques, readingList, users } from "./schema";

export const creativesRelations = relations(creatives, ({ one, many }) => ({
  user: one(users, {
    fields: [creatives.authorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  critiques: many(critiques),
  readingList: many(readingList),
}));

export const usersRelations = relations(users, ({ many }) => ({
  creatives: many(creatives),
  critiques: many(critiques),
  readingList: many(readingList),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  creative: one(creatives, {
    fields: [chapters.creativeId],
    references: [creatives.id],
  }),
}));

export const critiquesRelations = relations(critiques, ({ one }) => ({
  creative: one(creatives, {
    fields: [critiques.creativeId],
    references: [creatives.id],
  }),
  user: one(users, {
    fields: [critiques.userId],
    references: [users.id],
  }),
}));

export const readingListRelations = relations(readingList, ({ one }) => ({
  user: one(users, {
    fields: [readingList.userId],
    references: [users.id],
  }),
  creative: one(creatives, {
    fields: [readingList.creativeId],
    references: [creatives.id],
  }),
}));
