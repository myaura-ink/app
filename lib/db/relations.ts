import { relations } from "drizzle-orm/relations";
import { chapters, critiques, library, stories, storyTags, tags, users } from "./schema";

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.authorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  critiques: many(critiques),
  library: many(library),
  storyTags: many(storyTags),
}));

export const usersRelations = relations(users, ({ many }) => ({
  stories: many(stories),
  critiques: many(critiques),
  library: many(library),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  story: one(stories, {
    fields: [chapters.storyId],
    references: [stories.id],
  }),
}));

export const critiquesRelations = relations(critiques, ({ one }) => ({
  story: one(stories, {
    fields: [critiques.storyId],
    references: [stories.id],
  }),
  user: one(users, {
    fields: [critiques.userId],
    references: [users.id],
  }),
}));

export const libraryRelations = relations(library, ({ one }) => ({
  user: one(users, {
    fields: [library.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [library.storyId],
    references: [stories.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  storyTags: many(storyTags),
}));

export const storyTagsRelations = relations(storyTags, ({ one }) => ({
  story: one(stories, {
    fields: [storyTags.storyId],
    references: [stories.id],
  }),
  tag: one(tags, {
    fields: [storyTags.tagId],
    references: [tags.id],
  }),
}));
