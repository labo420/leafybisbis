import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/context/theme";
import { Fonts } from "@/constants/typography";
import { apiFetch } from "@/lib/api";

type Period = "weekly" | "monthly" | "all";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  level: string;
  score: number;
  co2SavedKg: number;
  isCurrentUser: boolean;
  avatarColor?: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Settimana",
  monthly: "Mese",
  all: "Totale",
};

const MEDAL = ["🥇", "🥈", "🥉"];

function initials(username: string): string {
  return username.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase() || "??";
}

function formatScore(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("weekly");

  const { data, isLoading, error, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", period],
    queryFn: () => apiFetch(`/leaderboard?period=${period}`),
    staleTime: 60_000,
  });

  const top3 = data?.filter(e => e.rank <= 3) ?? [];
  const rest = data?.filter(e => e.rank > 3 && e.rank <= 10) ?? [];
  const userEntry = data?.find(e => e.isCurrentUser);
  const userOutsideTop10 = userEntry && userEntry.rank > 10;

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={s.headerCenter}>
          <MaterialCommunityIcons name="trophy" size={18} color="#FFD700" />
          <Text style={[s.headerTitle, { color: theme.text }]}>Classifica</Text>
        </View>
        <View style={{ width: 34 }} />
      </View>

      {/* ── Period selector ── */}
      <View style={[s.periodRow, { backgroundColor: theme.background }]}>
        {(["weekly", "monthly", "all"] as Period[]).map(p => (
          <Pressable
            key={p}
            style={[
              s.periodPill,
              { borderColor: theme.border, backgroundColor: theme.card },
              period === p && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[s.periodPillText, { color: period === p ? "#fff" : theme.textSecondary }]}>
              {PERIOD_LABELS[p]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[s.errorText, { color: theme.textSecondary }]}>Impossibile caricare la classifica</Text>
          <Pressable style={[s.retryBtn, { borderColor: theme.border }]} onPress={() => refetch()}>
            <Text style={[s.retryText, { color: theme.primary }]}>Riprova</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Podio top 3 ── */}
          {top3.length > 0 && (
            <Animated.View entering={FadeInDown.delay(50).springify()} style={[s.podiumCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={s.podiumRow}>
                {/* 2° posto - sinistra */}
                {top3[1] ? <PodiumItem entry={top3[1]} height={90} theme={theme} /> : <View style={{ flex: 1 }} />}
                {/* 1° posto - centro (più alto) */}
                {top3[0] ? <PodiumItem entry={top3[0]} height={116} theme={theme} /> : <View style={{ flex: 1 }} />}
                {/* 3° posto - destra */}
                {top3[2] ? <PodiumItem entry={top3[2]} height={74} theme={theme} /> : <View style={{ flex: 1 }} />}
              </View>
            </Animated.View>
          )}

          {/* ── Lista 4-10 ── */}
          {rest.map((entry, i) => (
            <Animated.View key={entry.userId} entering={FadeInDown.delay(100 + i * 40).springify()}>
              <RankRow entry={entry} theme={theme} />
            </Animated.View>
          ))}

          {/* ── Utente corrente fuori top 10 ── */}
          {userOutsideTop10 && userEntry && (
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <View style={[s.dividerRow, { borderColor: theme.border }]}>
                <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
                <Text style={[s.dividerText, { color: theme.textMuted }]}>La tua posizione</Text>
                <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
              </View>
              <RankRow entry={userEntry} theme={theme} highlight />
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

/* ── Podium item ─────────────────────────────────────────────────────────── */
function PodiumItem({ entry, height, theme }: { entry: LeaderboardEntry; height: number; theme: any }) {
  const color = entry.avatarColor ?? "#4CAF50";
  const isFirst = entry.rank === 1;
  return (
    <View style={[s.podiumItem, { alignItems: "center" }]}>
      <Text style={s.medal}>{MEDAL[entry.rank - 1]}</Text>
      <View style={[
        s.avatar,
        { backgroundColor: color, width: isFirst ? 60 : 50, height: isFirst ? 60 : 50, borderRadius: isFirst ? 30 : 25 },
        entry.isCurrentUser && { borderWidth: 2.5, borderColor: "#FFD700" },
      ]}>
        <Text style={[s.avatarText, { fontSize: isFirst ? 20 : 17 }]}>{initials(entry.username)}</Text>
      </View>
      <Text style={[s.podiumName, { color: theme.text }]} numberOfLines={1}>{entry.username}</Text>
      <View style={[s.podiumBar, { height, backgroundColor: entry.rank === 1 ? "#FFD70033" : "#00000010", borderColor: entry.rank === 1 ? "#FFD700" : theme.border }]}>
        <Text style={[s.podiumScore, { color: theme.primary }]}>{formatScore(entry.score)}</Text>
        <Text style={[s.podiumLabel, { color: theme.textMuted }]}>drops</Text>
      </View>
    </View>
  );
}

/* ── Rank row ────────────────────────────────────────────────────────────── */
function RankRow({ entry, theme, highlight = false }: { entry: LeaderboardEntry; theme: any; highlight?: boolean }) {
  const color = entry.avatarColor ?? "#4CAF50";
  const isMe = entry.isCurrentUser;
  return (
    <View style={[
      s.rankRow,
      { backgroundColor: theme.card, borderColor: theme.border },
      (isMe || highlight) && { borderColor: theme.primary, backgroundColor: `${theme.primary}12` },
    ]}>
      <Text style={[s.rankNum, { color: isMe ? theme.primary : theme.textMuted, fontFamily: isMe ? Fonts.bodyBold : Fonts.bodyMedium }]}>
        #{entry.rank}
      </Text>
      <View style={[s.rowAvatar, { backgroundColor: color }]}>
        <Text style={s.rowAvatarText}>{initials(entry.username)}</Text>
      </View>
      <View style={s.rankInfo}>
        <Text style={[s.rankName, { color: theme.text }]} numberOfLines={1}>
          {entry.username}{isMe ? "  👋" : ""}
        </Text>
        <Text style={[s.rankLevel, { color: theme.textMuted }]}>{entry.level}</Text>
      </View>
      <View style={s.rankScoreCol}>
        <Text style={[s.rankScore, { color: theme.text }]}>{formatScore(entry.score)}</Text>
        <Text style={[s.rankScoreLabel, { color: theme.textMuted }]}>drops</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 17, fontFamily: Fonts.bodyBold },

  periodRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  periodPillText: { fontSize: 13, fontFamily: Fonts.bodyMedium },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  retryText: { fontSize: 13, fontFamily: Fonts.bodyMedium },

  scrollContent: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },

  podiumCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  podiumItem: { flex: 1, alignItems: "center", gap: 4 },
  medal: { fontSize: 24 },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontFamily: Fonts.bodyBold },
  podiumName: { fontSize: 11, fontFamily: Fonts.bodyMedium, textAlign: "center", maxWidth: 80 },
  podiumBar: {
    width: "90%",
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    gap: 2,
    paddingVertical: 4,
  },
  podiumScore: { fontSize: 15, fontFamily: Fonts.bodyBold },
  podiumLabel: { fontSize: 9, fontFamily: Fonts.bodyRegular },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  rankNum: { width: 28, fontSize: 13, textAlign: "right" },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rowAvatarText: { color: "#fff", fontSize: 14, fontFamily: Fonts.bodyBold },
  rankInfo: { flex: 1, gap: 2 },
  rankName: { fontSize: 14, fontFamily: Fonts.bodyMedium },
  rankLevel: { fontSize: 11, fontFamily: Fonts.bodyRegular },
  rankScoreCol: { alignItems: "flex-end", gap: 1 },
  rankScore: { fontSize: 15, fontFamily: Fonts.bodyBold },
  rankScoreLabel: { fontSize: 10, fontFamily: Fonts.bodyRegular },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 11, fontFamily: Fonts.bodyMedium },
});
