// Seeds a demo author and a published story with chapters, for local development.
// Safe to re-run: the demo story is deleted and recreated each time.
//
//   npm run db:seed

import { eq } from "drizzle-orm";
import { chapters, critiques, db, setStoryTags, stories, users } from "@/lib";
import { hashPassword } from "@/lib/auth/password";
import { toSlug } from "@/lib/utils/slug";
import { normalizeTag } from "@/lib/utils/tags";
import { story, chapters as storyChapters, critiques as storyCritiques } from "./seed/lamplighter";

const DEMO_USER = {
  name: "Aura Demo",
  email: "demo@aura.local",
  password: "aura-demo-1234",
  slug: "aura-demo",
};

const findOrCreateDemoUser = async () => {
  const [existing] = await db.select().from(users).where(eq(users.email, DEMO_USER.email));
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      slug: DEMO_USER.slug,
      password: await hashPassword(DEMO_USER.password),
    })
    .returning();
  return created;
};

// demo readers share the demo password; they exist only to leave critiques
const findOrCreateReader = async (name: string) => {
  const slug = `demo-${toSlug(name)}`;
  const email = `${slug}@aura.local`;
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ name, email, slug, password: await hashPassword(DEMO_USER.password) })
    .returning();
  return created;
};

const main = async () => {
  const author = await findOrCreateDemoUser();
  const readers = await Promise.all(storyCritiques.map((c) => findOrCreateReader(c.reader)));

  const seeded = await db.transaction(async (tx) => {
    await tx.delete(stories).where(eq(stories.slug, story.slug));

    const [created] = await tx
      .insert(stories)
      .values({
        title: story.title,
        slug: story.slug,
        description: story.description,
        coverImage: story.coverImage,
        genre: story.genre,
        published: 1,
        authorId: author.id,
      })
      .returning();

    await tx.insert(chapters).values(
      storyChapters.map((chapter, i) => ({
        storyId: created.id,
        title: chapter.title,
        slug: toSlug(chapter.title),
        content: chapter.content,
        order: i + 1,
        published: chapter.published ? 1 : 0,
      })),
    );

    await setStoryTags(created.id, story.tags.map(normalizeTag), tx);

    // spread critiques over the past weeks, oldest first, so ordering is visible
    const now = Date.now();
    await tx.insert(critiques).values(
      storyCritiques.map((critique, i) => ({
        storyId: created.id,
        userId: readers[i].id,
        body: critique.body,
        rating: critique.rating,
        createdAt: new Date(now - (storyCritiques.length - i) * 36 * 60 * 60 * 1000),
      })),
    );
    return created;
  });

  const published = storyChapters.filter((c) => c.published).length;
  console.log(
    `Seeded "${story.title}" with ${published} published chapters, ${storyChapters.length - published} draft and ${storyCritiques.length} critiques.`,
  );
  console.log(`  Story:  /story/${seeded.slug}`);
  console.log(`  Author: /profile/${author.slug}  (sign in as ${DEMO_USER.email} / ${DEMO_USER.password})`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
