import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { Fonts } from "@/constants/typography";

export default function MappaScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Negozi partner</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.centered}>
        <Feather name="map" size={48} color={theme.textMuted} />
        <Text style={[styles.msg, { color: theme.textSecondary }]}>
          La mappa è disponibile sull'app mobile.
        </Text>
      </View>
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
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontFamily: Fonts.displayBold, flex: 1, textAlign: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  msg: { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center", lineHeight: 22 },
});
