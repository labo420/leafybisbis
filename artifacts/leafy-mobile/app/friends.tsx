import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
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
  friendLevel: string;
  friendProfileImageUrl: string | null;
  createdAt: string;
}

interface SearchResult {
  id: number;
  username: string;
  drops: number;
  level: string;
  profileImageUrl: string | null;
  friendshipStatus: string | null;
}

interface Suggestion {
  id: number;
  username: string;
  drops: number;
  level: string;
  profileImageUrl: string | null;
}

interface FriendPublicProfile {
  id: number;
  username: string;
  profileImageUrl: string | null;
  drops: number;
  level: string;
  levelProgress: number;
  nextLevelPoints: number;
  co2SavedKg: number;
  badges: Array<{ id: string; emoji: string; name: string }>;
}

const AVATAR_COLORS = [
  "#4CAF50", "#2E7D32", "#66BB6A", "#43A047", "#1B5E20",
  "#388E3C", "#81C784", "#00897B", "#00695C", "#3B82F6",
];

const LEVEL_EMOJI: Record<string, string> = {
  Germoglio: "🌱",
  Ramoscello: "🌿",
  Arbusto: "🍃",
  Albero: "🌳",
  Foresta: "🌲",
  Giungla: "🌴",
};

const LEVEL_COLOR: Record<string, string> = {
  Germoglio: "#8BC34A",
  Ramoscello: "#66BB6A",
  Arbusto: "#43A047",
  Albero: "#2E7D32",
  Foresta: "#1B5E20",
  Giungla: "#004D40",
};

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(username: string) {
  return (username ?? "").replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase() || "??";
}

function formatDrops(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function AvatarImage({
  profileImageUrl,
  id,
  username,
  size = 44,
}: {
  profileImageUrl: string | null;
  id: number;
  username: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const borderRadius = size / 2;

  if (profileImageUrl && !imgError) {
    return (
      <Image
        source={{ uri: profileImageUrl }}
        style={{ width: size, height: size, borderRadius }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius,
      backgroundColor: avatarColor(id),
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Text style={{ color: "#fff", fontSize: size * 0.36, fontFamily: Fonts.bodyBold }}>
        {initials(username)}
      </Text>
    </View>
  );
}

function LevelBadge({ level }: { level: string }) {
  const emoji = LEVEL_EMOJI[level] ?? "🌱";
  const color = LEVEL_COLOR[level] ?? "#8BC34A";
  return (
    <View style={[levelBadgeStyles.pill, { backgroundColor: color + "20", borderColor: color + "40" }]}>
      <Text style={levelBadgeStyles.emoji}>{emoji}</Text>
      <Text style={[levelBadgeStyles.text, { color }]}>{level}</Text>
    </View>
  );
}

const levelBadgeStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  emoji: { fontSize: 11 },
  text: { fontSize: 11, fontFamily: Fonts.bodyMedium },
});

function AnimatedEmptyFriends({ theme }: { theme: any }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: "center", paddingTop: 40, gap: 12 }}>
      <Animated.View style={animStyle}>
        <View style={[emptyStyles.iconCircle, { backgroundColor: theme.primaryLight }]}>
          <MaterialCommunityIcons name="account-group-outline" size={42} color={theme.primary} />
        </View>
      </Animated.View>
      <Text style={[emptyStyles.title, { color: theme.text }]}>Ancora nessun amico 🌱</Text>
      <Text style={[emptyStyles.body, { color: theme.textSecondary }]}>
        Cerca un amico per iniziare a crescere insieme e salire in classifica!
      </Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 17, fontFamily: Fonts.bodyBold, textAlign: "center" },
  body: { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center", paddingHorizontal: 32 },
});

function FriendProfileSheet({
  friendId,
  visible,
  onClose,
  theme,
  insets,
  onRemove,
}: {
  friendId: number | null;
  visible: boolean;
  onClose: () => void;
  theme: any;
  insets: any;
  onRemove?: () => void;
}) {
  const { data: profile, isLoading } = useQuery<FriendPublicProfile>({
    queryKey: ["friend-profile", friendId],
    queryFn: () => apiFetch(`/users/${friendId}/profile-public`),
    enabled: visible && friendId != null,
    staleTime: 30_000,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={[sheetStyles.sheet, {
        backgroundColor: theme.modalBackground,
        paddingBottom: insets.bottom + 16,
        borderColor: theme.border,
      }]}>
        <View style={[sheetStyles.handle, { backgroundColor: theme.border }]} />

        {isLoading || !profile ? (
          <View style={sheetStyles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            <View style={sheetStyles.profileHeader}>
              <AvatarImage
                profileImageUrl={profile.profileImageUrl}
                id={profile.id}
                username={profile.username}
                size={64}
              />
              <View style={sheetStyles.profileInfo}>
                <Text style={[sheetStyles.profileName, { color: theme.text }]}>{profile.username}</Text>
                <LevelBadge level={profile.level} />
              </View>
            </View>

            <View style={[sheetStyles.statsRow, { borderColor: theme.border }]}>
              <View style={sheetStyles.statItem}>
                <Text style={[sheetStyles.statValue, { color: theme.primary }]}>
                  {(profile.drops ?? 0).toLocaleString("it-IT")}
                </Text>
                <Text style={[sheetStyles.statLabel, { color: theme.textMuted }]}>drops</Text>
              </View>
              <View style={[sheetStyles.statDivider, { backgroundColor: theme.border }]} />
              <View style={sheetStyles.statItem}>
                <Text style={[sheetStyles.statValue, { color: theme.primary }]}>
                  {profile.co2SavedKg.toFixed(1)} kg
                </Text>
                <Text style={[sheetStyles.statLabel, { color: theme.textMuted }]}>CO₂ risparmiata</Text>
              </View>
            </View>

            {profile.badges.length > 0 && (
              <View style={sheetStyles.badgesSection}>
                <Text style={[sheetStyles.badgesTitle, { color: theme.textSecondary }]}>Traguardi</Text>
                <View style={sheetStyles.badgesRow}>
                  {profile.badges.map(b => (
                    <View key={b.id} style={[sheetStyles.badgePill, { backgroundColor: theme.primaryLight }]}>
                      <Text style={sheetStyles.badgeEmoji}>{b.emoji}</Text>
                      <Text style={[sheetStyles.badgeName, { color: theme.primary }]}>{b.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {onRemove && (
              <Pressable
                style={[sheetStyles.removeBtn, { borderColor: theme.red }]}
                onPress={() => { onClose(); onRemove(); }}
              >
                <MaterialCommunityIcons name="account-remove-outline" size={16} color={theme.red} />
                <Text style={[sheetStyles.removeBtnText, { color: theme.red }]}>Rimuovi amico</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    minHeight: 300,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 20, fontFamily: Fonts.bodyBold },
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue: { fontSize: 20, fontFamily: Fonts.bodyBold },
  statLabel: { fontSize: 12, fontFamily: Fonts.bodyRegular, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth },
  badgesSection: { marginBottom: 16 },
  badgesTitle: { fontSize: 12, fontFamily: Fonts.bodyMedium, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeEmoji: { fontSize: 14 },
  badgeName: { fontSize: 12, fontFamily: Fonts.bodyMedium },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  removeBtnText: { fontSize: 14, fontFamily: Fonts.bodyMedium },
});

export default function FriendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [selectedFriendshipId, setSelectedFriendshipId] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const { data: friends = [], isLoading, refetch } = useQuery<Friend[]>({
    queryKey: ["friends"],
    queryFn: () => apiFetch("/friends"),
    enabled: !!user,
  });

  const { data: searchResults = [], isFetching: isSearching } = useQuery<SearchResult[]>({
    queryKey: ["friends-search", debouncedSearch],
    queryFn: () => apiFetch(`/friends/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length >= 2,
    staleTime: 10_000,
  });

  const accepted = friends.filter(f => f.status === "accepted");
  const pending = friends.filter(f => f.status === "pending");
  const incomingRequests = pending.filter(f => !f.isSentByMe);
  const sentRequests = pending.filter(f => f.isSentByMe);

  const { data: suggestions = [] } = useQuery<Suggestion[]>({
    queryKey: ["friends-suggestions"],
    queryFn: () => apiFetch("/friends/suggestions"),
    enabled: !!user && accepted.length < 5,
    staleTime: 60_000,
  });

  const { data: referralData } = useQuery<{ code: string; referralUrl: string }>({
    queryKey: ["profile-referral"],
    queryFn: () => apiFetch("/profile/referral"),
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const requestMutation = useMutation({
    mutationFn: (username: string) =>
      apiFetch("/friends/request", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-search"] });
      queryClient.invalidateQueries({ queryKey: ["friends-suggestions"] });
      setSearchText("");
      Keyboard.dismiss();
      Alert.alert("Richiesta inviata!", `Richiesta di amicizia inviata a ${username}`);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-suggestions"] });
    },
  });

  function openFriendSheet(friendId: number, friendshipId: number) {
    setSelectedFriendId(friendId);
    setSelectedFriendshipId(friendshipId);
    setSheetVisible(true);
  }

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

  async function handleShare() {
    try {
      const code = referralData?.code;
      if (!code) return;
      await Share.share({
        message: `Unisciti a Leafy e guadagna drops per i tuoi acquisti sostenibili! 🌱\nUsa il mio codice: ${code}\nhttps://leafy.app/join?ref=${code}`,
        title: "Invita un amico su Leafy",
      });
    } catch {}
  }

  const isSearchMode = debouncedSearch.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerIcon]}>🌿</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Amici</Text>
          {accepted.length > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.headerBadgeText, { color: theme.primary }]}>{accepted.length}</Text>
            </View>
          )}
        </View>
        <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={12}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* ── Cerca amico ── */}
        <View style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.searchCardHeader}>
            <View>
              <Text style={[styles.searchLabel, { color: theme.text }]}>Aggiungi un amico</Text>
              <Text style={[styles.searchHint, { color: theme.textSecondary }]}>Cerca per nome utente</Text>
            </View>
            {referralData?.code && (
              <Pressable
                style={[styles.inviteBtn, { backgroundColor: theme.primaryLight }]}
                onPress={handleShare}
              >
                <MaterialCommunityIcons name="gift-outline" size={14} color={theme.primary} />
                <Text style={[styles.inviteBtnText, { color: theme.primary }]}>Invita</Text>
              </Pressable>
            )}
          </View>
          <View style={[styles.searchRow, { borderColor: isSearchMode ? theme.primary : theme.border, backgroundColor: theme.background }]}>
            <MaterialCommunityIcons name="account-search-outline" size={20} color={isSearchMode ? theme.primary : theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Cerca username..."
              placeholderTextColor={theme.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText("")} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
            {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
          </View>

          {/* ── Search results ── */}
          {isSearchMode && (
            <View style={[styles.searchResults, { borderColor: theme.border }]}>
              {searchResults.length === 0 && !isSearching ? (
                <Text style={[styles.noResults, { color: theme.textMuted }]}>Nessun utente trovato</Text>
              ) : (
                searchResults.map(result => (
                  <View key={result.id} style={[styles.searchResultRow, { borderBottomColor: theme.border }]}>
                    <AvatarImage profileImageUrl={result.profileImageUrl} id={result.id} username={result.username} size={38} />
                    <View style={styles.searchResultInfo}>
                      <Text style={[styles.searchResultName, { color: theme.text }]}>{result.username}</Text>
                      <LevelBadge level={result.level} />
                    </View>
                    {result.friendshipStatus === "accepted" ? (
                      <View style={[styles.alreadyFriendBadge, { backgroundColor: theme.primaryLight }]}>
                        <MaterialCommunityIcons name="check" size={12} color={theme.primary} />
                        <Text style={[styles.alreadyFriendText, { color: theme.primary }]}>Amici</Text>
                      </View>
                    ) : result.friendshipStatus === "pending" ? (
                      <View style={[styles.alreadyFriendBadge, { backgroundColor: theme.cardAlt }]}>
                        <Text style={[styles.alreadyFriendText, { color: theme.textMuted }]}>In attesa</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={[styles.addBtn, { backgroundColor: theme.primary }]}
                        onPress={() => requestMutation.mutate(result.username)}
                        disabled={requestMutation.isPending}
                      >
                        {requestMutation.isPending && requestMutation.variables === result.username
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <MaterialCommunityIcons name="account-plus-outline" size={16} color="#fff" />
                        }
                      </Pressable>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
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
                {tab === "friends" ? `Amici${accepted.length > 0 ? ` (${accepted.length})` : ""}` : `Richieste${incomingRequests.length > 0 ? ` (${incomingRequests.length})` : ""}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : activeTab === "friends" ? (
          <>
            {accepted.length === 0 ? (
              <AnimatedEmptyFriends theme={theme} />
            ) : (
              accepted.map((f, i) => (
                <Animated.View key={f.id} entering={FadeInDown.delay(i * 40).springify()}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.friendRow,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      pressed && { opacity: 0.82 },
                    ]}
                    onPress={() => openFriendSheet(f.friendId, f.id)}
                  >
                    <AvatarImage
                      profileImageUrl={f.friendProfileImageUrl}
                      id={f.friendId}
                      username={f.friendUsername}
                      size={46}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                      <View style={styles.friendMeta}>
                        <LevelBadge level={f.friendLevel ?? "Germoglio"} />
                        <Text style={[styles.friendDropsText, { color: theme.textMuted }]}>
                          · {formatDrops(f.friendDrops ?? 0)} drops
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={theme.border} />
                  </Pressable>
                </Animated.View>
              ))
            )}

            {sentRequests.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Richieste inviate</Text>
                {sentRequests.map((f, i) => (
                  <Animated.View key={f.id} entering={FadeInDown.delay(i * 40).springify()}>
                    <View style={[styles.friendRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <AvatarImage
                        profileImageUrl={f.friendProfileImageUrl}
                        id={f.friendId}
                        username={f.friendUsername}
                        size={46}
                      />
                      <View style={styles.friendInfo}>
                        <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                        <Text style={[styles.friendDropsText, { color: theme.textMuted }]}>In attesa di risposta...</Text>
                      </View>
                      <Pressable onPress={() => deleteMutation.mutate(f.id)} hitSlop={8}>
                        <MaterialCommunityIcons name="close" size={18} color={theme.textMuted} />
                      </Pressable>
                    </View>
                  </Animated.View>
                ))}
              </>
            )}

            {/* ── Suggerimenti ── */}
            {suggestions.length > 0 && accepted.length < 5 && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Persone che potresti conoscere</Text>
                {suggestions.map((s, i) => (
                  <Animated.View key={s.id} entering={FadeInDown.delay(i * 40).springify()}>
                    <View style={[styles.friendRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <AvatarImage profileImageUrl={s.profileImageUrl} id={s.id} username={s.username} size={46} />
                      <View style={styles.friendInfo}>
                        <Text style={[styles.friendName, { color: theme.text }]}>{s.username}</Text>
                        <LevelBadge level={s.level} />
                      </View>
                      <Pressable
                        style={[styles.addBtn, { backgroundColor: theme.primary }]}
                        onPress={() => requestMutation.mutate(s.username)}
                        disabled={requestMutation.isPending}
                      >
                        <MaterialCommunityIcons name="account-plus-outline" size={16} color="#fff" />
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
                    <AvatarImage
                      profileImageUrl={f.friendProfileImageUrl}
                      id={f.friendId}
                      username={f.friendUsername}
                      size={46}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: theme.text }]}>{f.friendUsername}</Text>
                      <View style={styles.friendMeta}>
                        <LevelBadge level={f.friendLevel ?? "Germoglio"} />
                        <Text style={[styles.friendDropsText, { color: theme.textMuted }]}>
                          · vuole diventare tuo amico
                        </Text>
                      </View>
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

      <FriendProfileSheet
        friendId={selectedFriendId}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        theme={theme}
        insets={insets}
        onRemove={selectedFriendshipId != null ? () => {
          if (selectedFriendshipId != null) deleteMutation.mutate(selectedFriendshipId);
        } : undefined}
      />
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
  shareBtn: { padding: 4, width: 34, alignItems: "flex-end" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerIcon: { fontSize: 18 },
  headerTitle: { fontSize: 17, fontFamily: Fonts.bodyBold },
  headerBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  headerBadgeText: { fontSize: 12, fontFamily: Fonts.bodyBold },

  scroll: { padding: 16, gap: 12 },

  searchCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  searchCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchLabel: { fontSize: 16, fontFamily: Fonts.bodyBold },
  searchHint: { fontSize: 13, fontFamily: Fonts.bodyRegular },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inviteBtnText: { fontSize: 13, fontFamily: Fonts.bodyMedium },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: Fonts.bodyRegular, paddingVertical: 4 },
  searchResults: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  noResults: {
    fontSize: 14,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    paddingVertical: 14,
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchResultInfo: { flex: 1, gap: 3 },
  searchResultName: { fontSize: 14, fontFamily: Fonts.bodyMedium },
  alreadyFriendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  alreadyFriendText: { fontSize: 11, fontFamily: Fonts.bodyMedium },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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

  sectionLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  friendInfo: { flex: 1, gap: 5 },
  friendName: { fontSize: 15, fontFamily: Fonts.bodyMedium },
  friendMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  friendDropsText: { fontSize: 12, fontFamily: Fonts.bodyRegular },

  actionBtns: { flexDirection: "row", gap: 8 },
  acceptBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  declineBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
