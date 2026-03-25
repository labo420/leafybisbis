import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, challengesTable, challengeProgressTable, usersTable } from "@workspace/db";
import { GetChallengesResponse } from "@workspace/api-zod";
import { requireUser } from "./profile";

const router: IRouter = Router();

router.get("/challenges", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const challenges = await db.select().from(challengesTable)
    .where(eq(challengesTable.isActive, true));

  const result = await Promise.all(challenges.map(async (c) => {
    const [progress] = await db.select().from(challengeProgressTable)
      .where(and(
        eq(challengeProgressTable.userId, user.id),
        eq(challengeProgressTable.challengeId, c.id)
      ));

    const currentCount = progress?.currentCount ?? 0;
    const isCompleted = progress?.isCompleted ?? false;
    const progressPercent = Math.min(100, Math.round((currentCount / c.targetCount) * 100));

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      emoji: c.emoji,
      challengeType: c.challengeType,
      targetCount: c.targetCount,
      currentCount,
      rewardPoints: c.rewardPoints,
      expiresAt: c.expiresAt,
      isCompleted,
      progressPercent,
    };
  }));

  res.json(GetChallengesResponse.parse(result));
});

/**
 * Update challenge progress for a user when they scan a product of a given category.
 * Awards drops + totalPoints when a challenge is completed.
 * Returns titles of any challenges completed in this call.
 */
export async function checkChallengeProgress(
  userId: number,
  productCategory: string,
): Promise<string[]> {
  const now = new Date();

  const activeChallenges = await db
    .select()
    .from(challengesTable)
    .where(and(eq(challengesTable.isActive, true), eq(challengesTable.category, productCategory)));

  const completed: string[] = [];

  for (const challenge of activeChallenges) {
    if (challenge.expiresAt && challenge.expiresAt < now) continue;

    const [progress] = await db
      .select()
      .from(challengeProgressTable)
      .where(and(eq(challengeProgressTable.userId, userId), eq(challengeProgressTable.challengeId, challenge.id)));

    if (progress?.isCompleted) continue;

    const newCount = (progress?.currentCount ?? 0) + 1;
    const isNowCompleted = newCount >= challenge.targetCount;

    if (progress) {
      await db
        .update(challengeProgressTable)
        .set({
          currentCount: newCount,
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted ? now : null,
        })
        .where(eq(challengeProgressTable.id, progress.id));
    } else {
      await db.insert(challengeProgressTable).values({
        userId,
        challengeId: challenge.id,
        currentCount: newCount,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? now : null,
      });
    }

    if (isNowCompleted && challenge.rewardPoints > 0) {
      await db
        .update(usersTable)
        .set({
          drops: sql`xp + ${challenge.rewardPoints}`,
          totalPoints: sql`total_points + ${challenge.rewardPoints}`,
        })
        .where(eq(usersTable.id, userId));
      completed.push(challenge.title);
    }
  }

  return completed;
}

export default router;
