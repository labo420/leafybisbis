import { Router, type IRouter } from "express";
import { db, friendshipsTable, usersTable, badgesTable, userBadgesTable, receiptsTable } from "@workspace/db";
import { requireUser } from "./profile";
import { eq, and, or, desc, ne, notInArray, ilike, sql, inArray } from "drizzle-orm";
import { createNotification } from "./notifications";
import { calculateLevel } from "../lib/scanner";

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
    ? await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          drops: usersTable.drops,
          profileImageUrl: usersTable.profileImageUrl,
        })
        .from(usersTable)
        .where(inArray(usersTable.id, userIds))
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  const result = friendships.map(f => {
    const otherId = f.requesterId === user.id ? f.addresseeId : f.requesterId;
    const otherUser = userMap.get(otherId);
    const drops = otherUser?.drops ?? 0;
    const { level } = calculateLevel(drops);
    return {
      id: f.id,
      status: f.status,
      isSentByMe: f.requesterId === user.id,
      friendId: otherId,
      friendUsername: otherUser?.username ?? "Utente",
      friendDrops: drops,
      friendLevel: level,
      friendProfileImageUrl: otherUser?.profileImageUrl ?? null,
      createdAt: f.createdAt,
    };
  });

  res.json(result);
});

router.get("/friends/search", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) {
    res.json([]);
    return;
  }

  const results = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      drops: usersTable.drops,
      profileImageUrl: usersTable.profileImageUrl,
    })
    .from(usersTable)
    .where(
      and(
        ne(usersTable.id, user.id),
        ilike(usersTable.username, `%${q}%`),
      )
    )
    .limit(10);

  const existingFriendships = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        eq(friendshipsTable.requesterId, user.id),
        eq(friendshipsTable.addresseeId, user.id),
      )
    );

  const friendshipMap = new Map<number, string>();
  for (const f of existingFriendships) {
    const otherId = f.requesterId === user.id ? f.addresseeId : f.requesterId;
    friendshipMap.set(otherId, f.status);
  }

  const mapped = results.map(u => {
    const { level } = calculateLevel(u.drops ?? 0);
    return {
      id: u.id,
      username: u.username,
      drops: u.drops,
      level,
      profileImageUrl: u.profileImageUrl ?? null,
      friendshipStatus: friendshipMap.get(u.id) ?? null,
    };
  });

  res.json(mapped);
});

router.get("/friends/suggestions", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const existingFriendships = await db
    .select()
    .from(friendshipsTable)
    .where(
      or(
        eq(friendshipsTable.requesterId, user.id),
        eq(friendshipsTable.addresseeId, user.id),
      )
    );

  const excludedIds = new Set<number>([user.id]);
  for (const f of existingFriendships) {
    excludedIds.add(f.requesterId);
    excludedIds.add(f.addresseeId);
  }

  const excluded = Array.from(excludedIds);

  const suggestions = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      drops: usersTable.drops,
      profileImageUrl: usersTable.profileImageUrl,
    })
    .from(usersTable)
    .where(
      excluded.length > 0
        ? notInArray(usersTable.id, excluded)
        : ne(usersTable.id, user.id)
    )
    .orderBy(sql`RANDOM()`)
    .limit(5);

  const mapped = suggestions.map(u => {
    const { level } = calculateLevel(u.drops ?? 0);
    return {
      id: u.id,
      username: u.username,
      drops: u.drops,
      level,
      profileImageUrl: u.profileImageUrl ?? null,
    };
  });

  res.json(mapped);
});

router.get("/users/:id/profile-public", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) {
    res.status(400).json({ error: "ID non valido." });
    return;
  }

  const [target] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      drops: usersTable.drops,
      profileImageUrl: usersTable.profileImageUrl,
    })
    .from(usersTable)
    .where(eq(usersTable.id, targetId));

  if (!target) {
    res.status(404).json({ error: "Utente non trovato." });
    return;
  }

  const drops = target.drops ?? 0;
  const { level, progressPercent, nextLevelPoints } = calculateLevel(drops);

  const receipts = await db
    .select({ greenItemsCount: receiptsTable.greenItemsCount })
    .from(receiptsTable)
    .where(eq(receiptsTable.userId, targetId));

  const co2SavedKg = Math.round(
    receipts.reduce((sum, r) => sum + (r.greenItemsCount ?? 0) * 0.1, 0) * 10
  ) / 10;

  const earnedBadges: Array<{ id: string; emoji: string; name: string }> = [];
  if (drops >= 0) earnedBadges.push({ id: "germoglio", emoji: "🌱", name: "Germoglio" });
  if (drops >= 500) earnedBadges.push({ id: "ramoscello", emoji: "🌿", name: "Ramoscello" });
  if (drops >= 2000) earnedBadges.push({ id: "arbusto", emoji: "🍃", name: "Arbusto" });
  if (drops >= 5000) earnedBadges.push({ id: "albero", emoji: "🌳", name: "Albero" });
  if (drops >= 10000) earnedBadges.push({ id: "foresta", emoji: "🌲", name: "Foresta" });
  if (drops >= 25000) earnedBadges.push({ id: "giungla", emoji: "🌴", name: "Giungla" });

  if (receipts.length > 0) earnedBadges.push({ id: "first_scan", emoji: "🌟", name: "Prima Scansione" });

  res.json({
    id: target.id,
    username: target.username,
    profileImageUrl: target.profileImageUrl ?? null,
    drops,
    level,
    levelProgress: progressPercent,
    nextLevelPoints,
    co2SavedKg,
    badges: earnedBadges.slice(-4),
  });
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
