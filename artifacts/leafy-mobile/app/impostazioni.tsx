import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notifications";
import { useTheme } from "@/context/theme";
import { apiFetch } from "@/lib/api";

type IconColor = { iconColor: string; iconBg: string };

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  iconColor,
  iconBg,
  theme,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  iconColor: string;
  iconBg: string;
  theme: import("@/constants/theme").ThemeColors;
}) {
  const handlePress = () => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.7 } : null]}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={[styles.rowIconCircle, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text> : null}
      {onPress ? <Feather name="chevron-right" size={16} color={theme.textMuted} /> : null}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  onChange,
  iconColor,
  iconBg,
  theme,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  iconColor: string;
  iconBg: string;
  theme: import("@/constants/theme").ThemeColors;
}) {
  const handleChange = (v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(v);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.rowIconCircle, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.toggleTextCol}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: theme.border, true: theme.mint }}
        thumbColor="#fff"
      />
    </View>
  );
}

const ACCOUNT_ICON: IconColor = { iconColor: "#3B82F6", iconBg: "rgba(59,130,246,0.10)" };
const NOTIF_ICON: IconColor  = { iconColor: "#F97316", iconBg: "rgba(249,115,22,0.10)" };
const PRIVACY_ICON: IconColor = { iconColor: "#8B5CF6", iconBg: "rgba(139,92,246,0.10)" };

export default function ImpostazioniScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { user, logout } = useAuth();
  const { theme, mode } = useTheme();
  const queryClient = useQueryClient();

  const { pushEnabled, setPushEnabled } = useNotifications();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [challengeAlerts, setChallengeAlerts] = useState(true);

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Sei sicuro?",
      "Questa azione è irreversibile. Tutti i tuoi dati, punti e badge verranno cancellati permanentemente.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Cancella account",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch("/profile/account", { method: "DELETE" });
              queryClient.clear();
              logout();
              router.replace("/(tabs)");
            } catch {
              Alert.alert("Errore", "Non è stato possibile cancellare l'account.");
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: topPadding + 16, backgroundColor: theme.background }]}>
        <Animated.View entering={FadeInDown.duration(320).springify()} style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, { backgroundColor: theme.cardAlt }, pressed && { opacity: 0.7 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          >
            <Feather name="arrow-left" size={22} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Impostazioni</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Account ── */}
          <Animated.View entering={FadeInDown.delay(60).duration(350).springify()}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Account</Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <SettingsRow
                icon="user"
                label="Nome utente"
                value={user?.firstName ?? ""}
                iconColor={ACCOUNT_ICON.iconColor}
                iconBg={ACCOUNT_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingsRow
                icon="mail"
                label="Email"
                value={user?.email ?? ""}
                iconColor={ACCOUNT_ICON.iconColor}
                iconBg={ACCOUNT_ICON.iconBg}
                theme={theme}
              />
            </View>
          </Animated.View>

          {/* ── Notifiche ── */}
          <Animated.View entering={FadeInDown.delay(120).duration(350).springify()}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Notifiche</Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <ToggleRow
                icon="bell"
                label="Notifiche push"
                description="Avvisi su punti, sfide e walk-in"
                value={pushEnabled}
                onChange={setPushEnabled}
                iconColor={NOTIF_ICON.iconColor}
                iconBg={NOTIF_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ToggleRow
                icon="mail"
                label="Notifiche email"
                description="Aggiornamenti settimanali via email"
                value={emailNotifications}
                onChange={setEmailNotifications}
                iconColor={NOTIF_ICON.iconColor}
                iconBg={NOTIF_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ToggleRow
                icon="globe"
                label="Report settimanale"
                description="Riepilogo del tuo impatto verde"
                value={weeklyReport}
                onChange={setWeeklyReport}
                iconColor={NOTIF_ICON.iconColor}
                iconBg={NOTIF_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <ToggleRow
                icon="bell"
                label="Avvisi sfide"
                description="Promemoria scadenze sfide mensili"
                value={challengeAlerts}
                onChange={setChallengeAlerts}
                iconColor={NOTIF_ICON.iconColor}
                iconBg={NOTIF_ICON.iconBg}
                theme={theme}
              />
            </View>
          </Animated.View>

          {/* ── Privacy e Sicurezza ── */}
          <Animated.View entering={FadeInDown.delay(180).duration(350).springify()}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Privacy e Sicurezza</Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <SettingsRow
                icon="shield"
                label="Informativa Privacy"
                onPress={() => {}}
                iconColor={PRIVACY_ICON.iconColor}
                iconBg={PRIVACY_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingsRow
                icon="lock"
                label="Termini di Servizio"
                onPress={() => {}}
                iconColor={PRIVACY_ICON.iconColor}
                iconBg={PRIVACY_ICON.iconBg}
                theme={theme}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingsRow
                icon="globe"
                label="Lingua"
                value="Italiano"
                onPress={() => {}}
                iconColor={PRIVACY_ICON.iconColor}
                iconBg={PRIVACY_ICON.iconBg}
                theme={theme}
              />
            </View>
          </Animated.View>

          {/* ── Zona Pericolo ── */}
          <Animated.View entering={FadeInDown.delay(240).duration(350).springify()}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Zona Pericolo</Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
                onPress={handleDeleteAccount}
              >
                <View style={[styles.rowIconCircle, { backgroundColor: "rgba(239,67,67,0.10)" }]}>
                  <Feather name="trash-2" size={16} color={Colors.red} />
                </View>
                <Text style={[styles.rowLabel, { color: Colors.red }]}>Cancella account</Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "DMSans_700Bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginRight: 4,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
});
