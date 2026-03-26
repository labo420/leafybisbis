import React, { useEffect } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { Fonts } from "@/constants/typography";
import { useInAppNotifications, type InAppNotification } from "@/hooks/useInAppNotifications";

type MCIcon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ICON_MAP: Record<string, MCIcon> = {
  drops_earned: "lightning-bolt",
  level_up: "arrow-up-circle",
  challenge_completed: "trophy",
  checkin: "fire",
  walkin: "store",
  friend_request: "account-plus",
  friend_accepted: "account-check",
  bell: "bell",
};

const ICON_COLOR_MAP: Record<string, string> = {
  drops_earned: "#FACC15",
  level_up: "#A78BFA",
  challenge_completed: "#F97316",
  checkin: "#F97316",
  walkin: "#2E6B50",
  friend_request: "#3B82F6",
  friend_accepted: "#10B981",
  bell: "#6B7280",
};

function formatRelative(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ora";
  if (mins < 60) return `${mins}m fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function NotifRow({ notif, theme }: { notif: InAppNotification; theme: any }) {
  const icon = ICON_MAP[notif.type] ?? ICON_MAP.bell;
  const iconColor = ICON_COLOR_MAP[notif.type] ?? ICON_COLOR_MAP.bell;

  return (
    <View style={[
      styles.row,
      { backgroundColor: notif.isRead ? theme.card : `${theme.primary}10`, borderColor: theme.border },
    ]}>
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>{notif.title}</Text>
          {!notif.isRead && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
        </View>
        <Text style={[styles.rowBody, { color: theme.textSecondary }]} numberOfLines={2}>{notif.body}</Text>
        <Text style={[styles.rowTime, { color: theme.textMuted }]}>{formatRelative(notif.createdAt)}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { notifications, isLoading, unreadCount, markAllRead } = useInAppNotifications(!!user);

  useEffect(() => {
    if (unreadCount > 0) {
      markAllRead();
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifiche</Text>
        <Pressable onPress={markAllRead} hitSlop={12} style={styles.readAllBtn}>
          <Text style={[styles.readAllText, { color: theme.primary }]}>Segna tutte lette</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="bell-sleep-outline" size={56} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Nessuna notifica</Text>
          <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Le tue notifiche appariranno qui</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((n, i) => (
            <Animated.View key={n.id} entering={FadeInDown.delay(i * 40).springify()}>
              <NotifRow notif={n} theme={theme} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4, width: 34 },
  headerTitle: { fontSize: 17, fontFamily: Fonts.bodyBold },
  readAllBtn: { padding: 4 },
  readAllText: { fontSize: 13, fontFamily: Fonts.bodyMedium },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.bodyBold, marginTop: 8 },
  emptyBody: { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center" },
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1, gap: 3 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowTitle: { flex: 1, fontSize: 14, fontFamily: Fonts.bodyMedium },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowBody: { fontSize: 13, fontFamily: Fonts.bodyRegular, lineHeight: 18 },
  rowTime: { fontSize: 11, fontFamily: Fonts.bodyRegular, marginTop: 2 },
});
