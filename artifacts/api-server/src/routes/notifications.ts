import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { requireUser } from "./profile";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications);
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, user.id));

  res.json({ ok: true });
});

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  body: string,
  icon: string = "bell",
) {
  try {
    await db.insert(notificationsTable).values({ userId, type, title, body, icon });
  } catch {}
}

export default router;
