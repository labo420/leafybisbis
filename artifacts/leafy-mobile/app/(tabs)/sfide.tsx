import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { Fonts } from "@/constants/typography";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { SkeletonBox, SkeletonCard } from "@/components/Skeleton";
import type { Challenge } from "@workspace/api-client-react";

function ChallengeCard({ challenge: ch, theme }: { challenge: Challenge; theme: ReturnType<typeof useTheme>["theme"] }) {
  const pct = ch.progressPercent;
  const isCompleted = ch.isCompleted;
  const typeLabel = ch.challengeType === "daily" ? "Giornaliera" : "Settimanale";
  const typeColor = ch.challengeType === "daily" ? theme.leaf : theme.mint;

  return (
    <View style={[challengeStyles.cardShadow, { shadowColor: isCompleted ? "#51B888" : "#000" }]}>
      <View style={[challengeStyles.card, { backgroundColor: isCompleted ? "rgba(81,184,136,0.08)" : theme.card }]}>
        <View style={[challengeStyles.emojiCircle, { backgroundColor: isCompleted ? "rgba(81,184,136,0.15)" : "rgba(46,107,80,0.10)" }]}>
          <Text style={challengeStyles.emoji}>{ch.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={challengeStyles.cardTopRow}>
            <Text style={[challengeStyles.cardTitle, { color: theme.text }]} numberOfLines={1}>{ch.title}</Text>
            {isCompleted && (
              <MaterialCommunityIcons name="check-circle" size={16} color="#51B888" style={{ marginLeft: 6 }} />
            )}
          </View>
          <Text style={[challengeStyles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{ch.description}</Text>
          <View style={challengeStyles.progressRow}>
            <View style={[challengeStyles.progressBg, { backgroundColor: theme.border }]}>
              <View style={[challengeStyles.progressFill, { width: `${pct}%`, backgroundColor: isCompleted ? "#51B888" : typeColor }]} />
            </View>
            <Text style={[challengeStyles.progressLabel, { color: theme.textSecondary }]}>{ch.currentCount}/{ch.targetCount}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={[challengeStyles.typePill, { backgroundColor: `${typeColor}22` }]}>
            <Text style={[challengeStyles.typePillText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
          <View style={challengeStyles.rewardPill}>
            <MaterialCommunityIcons name="gift-outline" size={11} color={theme.textMuted} />
            <Text style={[challengeStyles.rewardPillText, { color: theme.textMuted }]}>?</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const challengeStyles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: {
    fontSize: 22,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    flex: 1,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    marginBottom: 8,
    lineHeight: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    minWidth: 28,
    textAlign: "right",
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  typePillText: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.2,
  },
  rewardPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  rewardPillText: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
  },
});

export default function SfideScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPad  = Platform.OS === "web" ? 34 + 84 : 84 + insets.bottom;

  const { data: challenges, isLoading, refetch } = useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: () => apiFetch("/challenges"),
    enabled: !!user,
    staleTime: 30_000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: "#E8F5E9" }]}>
        <MaterialCommunityIcons name="flag-checkered" size={48} color="#2E6B50" />
        <Text style={[styles.guestTitle, { color: theme.text }]}>Sfide</Text>
        <Text style={[styles.guestSub, { color: theme.textSecondary }]}>
          Accedi per vedere le tue sfide quotidiane e settimanali.
        </Text>
      </View>
    );
  }

  const daily = challenges?.filter(c => c.challengeType === "daily") ?? [];
  const weekly = challenges?.filter(c => c.challengeType === "weekly") ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "#E8F5E9" }]}
      contentContainerStyle={{ paddingTop: topPadding, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.leaf} />}
    >
      <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="flag-checkered" size={22} color={theme.leaf} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sfide</Text>
        </View>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          Completa le sfide per guadagnare drops extra
        </Text>
      </Animated.View>

      {isLoading ? (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, gap: 10, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <SkeletonBox width={18} height={18} borderRadius={9} />
            <SkeletonBox width={100} height={14} />
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 4 }}>
            <SkeletonBox width={18} height={18} borderRadius={9} />
            <SkeletonBox width={80} height={14} />
          </View>
          <SkeletonCard />
        </Animated.View>
      ) : (
        <>
          {daily.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.group}>
              <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Giornaliere</Text>
              {daily.map(ch => (
                <ChallengeCard key={ch.id} challenge={ch} theme={theme} />
              ))}
            </Animated.View>
          )}

          {weekly.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.group}>
              <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Settimanali</Text>
              {weekly.map(ch => (
                <ChallengeCard key={ch.id} challenge={ch} theme={theme} />
              ))}
            </Animated.View>
          )}

          {(!challenges || challenges.length === 0) && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.emptyBox}>
              <MaterialCommunityIcons name="flag-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nessuna sfida attiva</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Le sfide vengono aggiornate ogni giorno. Torna presto!
              </Text>
            </Animated.View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  guestTitle: {
    fontSize: 28,
    fontFamily: Fonts.displayBold,
    textAlign: "center",
  },
  guestSub: {
    fontSize: 14,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.displayBold,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    lineHeight: 18,
  },
  group: {
    marginTop: 16,
    gap: 0,
  },
  groupLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyBox: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.displayBold,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    lineHeight: 20,
  },
});
