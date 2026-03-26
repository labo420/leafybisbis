import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { Fonts } from "@/constants/typography";
import { apiFetch } from "@/lib/api";

interface Friend {
  id: number;
  status: "pending" | "accepted";
  isSentByMe: boolean;
  friendId: number;
  friendUsername: string;
  friendDrops: number;
  createdAt: string;
}

const AVATAR_COLORS = [
  "#4CAF50", "#2E7D32", "#66BB6A", "#43A047", "#1B5E20",
  "#388E3C", "#81C784", "#00897B", "#00695C", "#3B82F6",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(username: string) {
  return (username ?? "").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase() || "??";
}

export default function FriendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  const { data: friends = [], isLoading } = useQuery<Friend[]>({
    queryKey: ["friends"],
    queryFn: () => apiFetch("/friends"),
    enabled: !!user,
  });

  const accepted = friends.filter(f => f.status === "accepted");
  const pending = friends.filter(f => f.status === "pending");
  const incomingRequests = pending.filter(f => !f.isSentByMe);
  const sentRequests = pending.filter(f => f.isSentByMe);

  const requestMutation = useMutation({
    mutationFn: (username: string) =>
      apiFetch("/friends/request", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setSearchText("");
      Keyboard.dismiss();
      Alert.alert("Richiesta inviata!", `Richiesta di amicizia inviata a ${searchText}`);
    },
    onError: (err: any) => {
      Alert.alert("Errore", err?.message ?? "Impossibile inviare la richiesta.");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/friends/${id}/accept`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/friends/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["friends"] }),
  });

  function confirmRemove(friend: Friend) {
    Alert.alert(
      "Rimuovi amico",
      `Vuoi rimuovere ${friend.friendUsername} dagli amici?`,
      [
        { text: "Annulla", style: "cancel" },
        { text: "Rimuovi", style: "destructive", onPress: () => deleteMutation.mutate(friend.id) },
      ],
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Amici</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cerca amico ── */}
        <View style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.searchLabel, { color: theme.text }]}>Aggiungi un amico</Text>
          <Text style={[styles.searchHint, { color: theme.textSecondary }]}>Inserisci il nome utente esatto</Text>
          <View style={[styles.searchRow, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <MaterialCommunityIcons name="account-search-outline" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Username..."
              placeholderTextColor={theme.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={() => {
                if (searchText.trim().length >= 2) requestMutation.mutate(searchText.trim());
              }}
            />
            <Pressable
              style={[styles.sendBtn, { backgroundColor: searchText.trim().length >= 2 ? theme.primary : theme.border }]}
              disabled={searchText.trim().length < 2 || requestMutation.isPending}
              onPress={() => requestMutation.mutate(searchText.trim())}
            >
              {requestMutation.isPending
                ? <ActivityIndicator size="small" color="#fff" />
                : <MaterialCommunityIcons name="send" size={16} color="#fff" />
              }
            </Pressable>
          </View>
        </View>

        {/* ── Tab selector ── */}
        <View style={[styles.tabRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {(["friends", "requests"] as const).map(tab => (
            <Pressable
              key={tab}
              style={[styles.tabPill, activeTab === tab && { backgroundColor: theme.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? "#fff" : theme.textSecondary }]}>
                {tab === "friends" ? `Amici (${accepted.length})` : `Richieste (${incomingRequests.length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : activeTab === "friends" ? (
          <>
            {accepted.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="account-group-outline" size={52} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Nessun amico ancora</Text>
                <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Cerca un utente per aggiungere il primo amico!</Text>
              </View>
            ) : (
              accepted.map((f, i) => (
                <Animated.View key={f.id} entering={FadeInDown.delay(i * 40).springify()}>
                  <View style={[styles.friendRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor(f.friendId) }]}>
                      <Text style={styles.avatarText}>{initials(f.friendUsername)}</Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                      <Text style={[styles.friendDrops, { color: theme.textMuted }]}>
                        {(f.friendDrops ?? 0).toLocaleString("it-IT")} drops
                      </Text>
                    </View>
                    <Pressable onPress={() => confirmRemove(f)} hitSlop={8}>
                      <MaterialCommunityIcons name="account-remove-outline" size={20} color={theme.textMuted} />
                    </Pressable>
                  </View>
                </Animated.View>
              ))
            )}

            {sentRequests.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Richieste inviate</Text>
                {sentRequests.map((f, i) => (
                  <Animated.View key={f.id} entering={FadeInDown.delay(i * 40).springify()}>
                    <View style={[styles.friendRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={[styles.avatar, { backgroundColor: avatarColor(f.friendId) }]}>
                        <Text style={styles.avatarText}>{initials(f.friendUsername)}</Text>
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                        <Text style={[styles.friendDrops, { color: theme.textMuted }]}>In attesa...</Text>
                      </View>
                      <Pressable onPress={() => deleteMutation.mutate(f.id)} hitSlop={8}>
                        <MaterialCommunityIcons name="close" size={18} color={theme.textMuted} />
                      </Pressable>
                    </View>
                  </Animated.View>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {incomingRequests.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="bell-sleep-outline" size={52} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Nessuna richiesta</Text>
                <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Non hai richieste di amicizia in arrivo</Text>
              </View>
            ) : (
              incomingRequests.map((f, i) => (
                <Animated.View key={f.id} entering={FadeInDown.delay(i * 40).springify()}>
                  <View style={[styles.friendRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor(f.friendId) }]}>
                      <Text style={styles.avatarText}>{initials(f.friendUsername)}</Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                      <Text style={[styles.friendDrops, { color: theme.textMuted }]}>vuole diventare tuo amico</Text>
                    </View>
                    <View style={styles.actionBtns}>
                      <Pressable
                        style={[styles.acceptBtn, { backgroundColor: theme.primary }]}
                        onPress={() => acceptMutation.mutate(f.id)}
                      >
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      </Pressable>
                      <Pressable
                        style={[styles.declineBtn, { borderColor: theme.border }]}
                        onPress={() => deleteMutation.mutate(f.id)}
                      >
                        <MaterialCommunityIcons name="close" size={16} color={theme.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </>
        )}
      </ScrollView>
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
  scroll: { padding: 16, gap: 12 },

  searchCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  searchLabel: { fontSize: 16, fontFamily: Fonts.bodyBold },
  searchHint: { fontSize: 13, fontFamily: Fonts.bodyRegular, marginBottom: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: Fonts.bodyRegular, paddingVertical: 4 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  tabRow: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  tabPill: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: Fonts.bodyMedium },

  empty: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.bodyBold },
  emptyBody: { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center" },

  sectionLabel: { fontSize: 12, fontFamily: Fonts.bodyMedium, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8 },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 16, fontFamily: Fonts.bodyBold },
  friendInfo: { flex: 1, gap: 2 },
  friendName: { fontSize: 15, fontFamily: Fonts.bodyMedium },
  friendDrops: { fontSize: 12, fontFamily: Fonts.bodyRegular },

  actionBtns: { flexDirection: "row", gap: 8 },
  acceptBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  declineBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
