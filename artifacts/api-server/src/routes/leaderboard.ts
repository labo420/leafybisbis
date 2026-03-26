import { Router, type IRouter } from "express";
import { db, usersTable, receiptsTable } from "@workspace/db";
import { GetLeaderboardResponse, GetLeaderboardQueryParams } from "@workspace/api-zod";
import { requireUser } from "./profile";
import { and, gte, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const AVATAR_COLORS = [
  "#4CAF50", "#2E7D32", "#66BB6A", "#43A047", "#1B5E20",
  "#388E3C", "#81C784", "#A5D6A7", "#00897B", "#00695C",
];

function avatarColor(userId: number): string {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function levelLabel(score: number): string {
  if (score >= 25000) return "Giungla";
  if (score >= 10000) return "Foresta";
  if (score >= 5000) return "Albero";
  if (score >= 2000) return "Arbusto";
  if (score >= 500) return "Ramoscello";
  return "Germoglio";
}

const FAKE_USERS = [
  { id: 101, username: "GreenStar🌿",    totalPoints: 3420, weeklyMul: 0.22, monthlyMul: 0.55 },
  { id: 102, username: "EcoLucia",       totalPoints: 2810, weeklyMul: 0.18, monthlyMul: 0.50 },
  { id: 103, username: "BioPaolo",       totalPoints: 2100, weeklyMul: 0.25, monthlyMul: 0.60 },
  { id: 104, username: "KmZeroFan",      totalPoints: 1850, weeklyMul: 0.30, monthlyMul: 0.65 },
  { id: 105, username: "VerdeAnna",      totalPoints: 1600, weeklyMul: 0.15, monthlyMul: 0.45 },
  { id: 106, username: "PlasticFree99",  totalPoints: 1200, weeklyMul: 0.20, monthlyMul: 0.52 },
  { id: 107, username: "LeafyFan",       totalPoints: 980,  weeklyMul: 0.28, monthlyMul: 0.58 },
  { id: 108, username: "NaturaViva",     totalPoints: 750,  weeklyMul: 0.12, monthlyMul: 0.40 },
  { id: 109, username: "EcoMario",       totalPoints: 620,  weeklyMul: 0.35, monthlyMul: 0.70 },
];

router.get("/leaderboard", async (req, res): Promise<void> => {
  const queryParams = GetLeaderboardQueryParams.safeParse(req.query);
  const period = queryParams.success ? (queryParams.data.period ?? "all") : "all";

  const user = await requireUser(req, res);
  if (!user) return;

  // ── Compute real-user scores per period ──────────────────────────────────
  let realUserScores: { userId: number; score: number }[] = [];

  if (period === "all") {
    const allUsers = await db
      .select({ userId: usersTable.id, score: usersTable.drops })
      .from(usersTable);
    realUserScores = allUsers.map(u => ({ userId: u.userId, score: u.score ?? 0 }));
  } else {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (period === "weekly" ? 7 : 30));

    const rows = await db
      .select({
        userId: receiptsTable.userId,
        score: sql<number>`cast(sum(${receiptsTable.pointsEarned}) as int)`,
      })
      .from(receiptsTable)
      .where(
        and(
          gte(receiptsTable.scannedAt, cutoff),
          eq(receiptsTable.status, "approved"),
        )
      )
      .groupBy(receiptsTable.userId);

    realUserScores = rows.map(r => ({ userId: r.userId, score: r.score ?? 0 }));
  }

  // ── Build user info map ───────────────────────────────────────────────────
  const allUsers = await db
    .select({ id: usersTable.id, username: usersTable.username, totalPoints: usersTable.totalPoints })
    .from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const realCombined = realUserScores.map(r => {
    const info = userMap.get(r.userId);
    return {
      id: r.userId,
      username: info?.username ?? "Utente",
      score: r.score,
      totalPoints: info?.totalPoints ?? 0,
      isFake: false,
    };
  });

  // ── Fake users ────────────────────────────────────────────────────────────
  const fakeCombined = FAKE_USERS.map(f => ({
    id: f.id,
    username: f.username,
    score: period === "weekly"
      ? Math.round(f.totalPoints * f.weeklyMul)
      : period === "monthly"
        ? Math.round(f.totalPoints * f.monthlyMul)
        : f.totalPoints,
    totalPoints: f.totalPoints,
    isFake: true,
  }));

  const combined = [...realCombined, ...fakeCombined];
  combined.sort((a, b) => b.score - a.score);

  // ── Find current user's global rank ───────────────────────────────────────
  const currentUserEntry = combined.find(u => !u.isFake && u.id === user.id);
  const userGlobalRank = currentUserEntry
    ? combined.findIndex(u => !u.isFake && u.id === user.id) + 1
    : combined.length + 1;

  // ── Top 10 ────────────────────────────────────────────────────────────────
  const top10 = combined.slice(0, 10).map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    username: u.username,
    level: levelLabel(u.totalPoints),
    score: u.score,
    co2SavedKg: Math.round(u.score * 0.008 * 100) / 100,
    isCurrentUser: !u.isFake && u.id === user.id,
    avatarColor: avatarColor(u.id),
  }));

  // ── Append current user if outside top 10 ────────────────────────────────
  const userInTop10 = top10.some(e => e.isCurrentUser);
  if (!userInTop10) {
    top10.push({
      rank: userGlobalRank,
      userId: user.id,
      username: user.username ?? "Tu",
      level: levelLabel(user.totalPoints),
      score: currentUserEntry?.score ?? 0,
      co2SavedKg: Math.round((currentUserEntry?.score ?? 0) * 0.008 * 100) / 100,
      isCurrentUser: true,
      avatarColor: avatarColor(user.id),
    });
  }

  res.json(GetLeaderboardResponse.parse(top10));
});

export default router;
