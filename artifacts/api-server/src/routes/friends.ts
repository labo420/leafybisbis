import { Router, type IRouter } from "express";
import { db, friendshipsTable, usersTable, notificationsTable } from "@workspace/db";
import { requireUser } from "./profile";
import { eq, and, or, desc } from "drizzle-orm";
import { createNotification } from "./notifications";

const router: IRouter = Router();

async function getFriendIds(userId: number): Promise<number[]> {
  const friendships = await db
    .select()
    .from(friendshipsTable)
    .where(
      and(
        or(
          eq(friendshipsTable.requesterId, userId),
          eq(friendshipsTable.addresseeId, userId),
        ),
        eq(friendshipsTable.status, "accepted"),
      )
    );

  return friendships.map(f =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );
}

export { getFriendIds };

router.get("/friends", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const friendships = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        eq(friendshipsTable.requesterId, user.id),
        eq(friendshipsTable.addresseeId, user.id),
      )
    )
    .orderBy(desc(friendshipsTable.createdAt));

  const userIds = [
    ...friendships.map(f => f.requesterId),
    ...friendships.map(f => f.addresseeId),
  ].filter((id, i, arr) => arr.indexOf(id) === i && id !== user.id);

  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, username: usersTable.username, drops: usersTable.drops }).from(usersTable)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  const result = friendships.map(f => {
    const otherId = f.requesterId === user.id ? f.addresseeId : f.requesterId;
    const otherUser = userMap.get(otherId);
    return {
      id: f.id,
      status: f.status,
      isSentByMe: f.requesterId === user.id,
      friendId: otherId,
      friendUsername: otherUser?.username ?? "Utente",
      friendDrops: otherUser?.drops ?? 0,
      createdAt: f.createdAt,
    };
  });

  res.json(result);
});

router.post("/friends/request", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { username } = req.body as { username?: string };
  if (!username || username.trim().length < 2) {
    res.status(400).json({ error: "Username non valido." });
    return;
  }

  const [target] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username.trim()));

  if (!target) {
    res.status(404).json({ error: "Utente non trovato." });
    return;
  }

  if (target.id === user.id) {
    res.status(400).json({ error: "Non puoi aggiungere te stesso." });
    return;
  }

  const existing = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        and(eq(friendshipsTable.requesterId, user.id), eq(friendshipsTable.addresseeId, target.id)),
        and(eq(friendshipsTable.requesterId, target.id), eq(friendshipsTable.addresseeId, user.id)),
      )
    );

  if (existing.length > 0) {
    res.status(409).json({ error: "Richiesta già esistente o già amici." });
    return;
  }

  await db.insert(friendshipsTable).values({
    requesterId: user.id,
    addresseeId: target.id,
    status: "pending",
  });

  await createNotification(
    target.id,
    "friend_request",
    "Nuova richiesta di amicizia",
    `${user.username ?? "Qualcuno"} vuole diventare tuo amico!`,
    "account-plus",
  );

  res.json({ ok: true });
});

router.patch("/friends/:id/accept", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const friendshipId = parseInt(req.params.id, 10);
  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(eq(friendshipsTable.id, friendshipId));

  if (!friendship || friendship.addresseeId !== user.id) {
    res.status(404).json({ error: "Richiesta non trovata." });
    return;
  }

  await db
    .update(friendshipsTable)
    .set({ status: "accepted" })
    .where(eq(friendshipsTable.id, friendshipId));

  await createNotification(
    friendship.requesterId,
    "friend_accepted",
    "Richiesta accettata!",
    `${user.username ?? "Qualcuno"} ha accettato la tua richiesta di amicizia.`,
    "account-check",
  );

  res.json({ ok: true });
});

router.delete("/friends/:id", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const friendshipId = parseInt(req.params.id, 10);
  const [friendship] = await db
    .select()
    .from(friendshipsTable)
    .where(eq(friendshipsTable.id, friendshipId));

  if (!friendship || (friendship.requesterId !== user.id && friendship.addresseeId !== user.id)) {
    res.status(404).json({ error: "Non trovato." });
    return;
  }

  await db.delete(friendshipsTable).where(eq(friendshipsTable.id, friendshipId));
  res.json({ ok: true });
});

export default router;
