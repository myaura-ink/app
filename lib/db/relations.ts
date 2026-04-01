import { relations } from "drizzle-orm/relations";
import { users, creatives, chapters } from "./schema";

export const creativesRelations = relations(creatives, ({one, many}) => ({
	user: one(users, {
		fields: [creatives.authorId],
		references: [users.id]
	}),
	chapters: many(chapters),
}));

export const usersRelations = relations(users, ({many}) => ({
	creatives: many(creatives),
}));

export const chaptersRelations = relations(chapters, ({one}) => ({
	creative: one(creatives, {
		fields: [chapters.creativeId],
		references: [creatives.id]
	}),
}));