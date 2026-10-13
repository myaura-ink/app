import { count, eq, gt, sql } from "drizzle-orm";
import { db, projectSupport } from "..";

export interface SupportSummary {
  likes: number;
  pledgers: number;
  me: { liked: boolean; pledge: number | null } | null;
}

export const getSupportSummary = async (userId?: string): Promise<SupportSummary> => {
  const [totals] = await db
    .select({
      likes: count(sql`case when ${projectSupport.liked} then 1 end`),
      pledgers: count(sql`case when ${projectSupport.pledge} > 0 then 1 end`),
    })
    .from(projectSupport);

  let me: SupportSummary["me"] = null;
  if (userId) {
    const [row] = await db
      .select({ liked: projectSupport.liked, pledge: projectSupport.pledge })
      .from(projectSupport)
      .where(eq(projectSupport.userId, userId))
      .limit(1);
    me = row ?? { liked: false, pledge: null };
  }

  return { likes: totals?.likes ?? 0, pledgers: totals?.pledgers ?? 0, me };
};

export const setSupport = async (
  userId: string,
  changes: { liked?: boolean; pledge?: number | null },
): Promise<void> => {
  await db
    .insert(projectSupport)
    .values({ userId, ...changes })
    .onConflictDoUpdate({ target: projectSupport.userId, set: changes });
};

// pledge breakdown for the owner; not exposed publicly
export const getPledgeBreakdown = async () =>
  db
    .select({ pledge: projectSupport.pledge, users: count() })
    .from(projectSupport)
    .where(gt(projectSupport.pledge, 0))
    .groupBy(projectSupport.pledge)
    .orderBy(projectSupport.pledge);
