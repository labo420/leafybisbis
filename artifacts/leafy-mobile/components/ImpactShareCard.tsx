import React, { forwardRef } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Fonts } from "@/constants/typography";

const LEVEL_EMOJI: Record<string, string> = {
  Germoglio: "🌱",
  Ramoscello: "🌿",
  Arbusto: "🍃",
  Albero: "🌳",
  Foresta: "🌲",
  Giungla: "🌴",
};

export interface ImpactShareCardProps {
  co2Kg: number;
  waterLiters: number;
  plasticKg: number;
  greenProducts: number;
  receiptsScanned: number;
  level: string;
  username?: string;
}

const CARD_W = 360;
const CARD_H = 500;

const ImpactShareCard = forwardRef<View, ImpactShareCardProps>(
  ({ co2Kg, waterLiters, plasticKg, greenProducts, receiptsScanned, level, username }, ref) => {
    const emoji = LEVEL_EMOJI[level] ?? "🌿";

    const metrics = [
      {
        icon: "wind" as const,
        label: "CO₂ risparmiata",
        value: `${co2Kg.toFixed(1)} kg`,
        sub: `≈ ${Math.round(co2Kg * 5)} km in auto`,
        color: "#51B888",
      },
      {
        icon: "droplet" as const,
        label: "Acqua salvata",
        value: `${Math.round(waterLiters)} L`,
        sub: `≈ ${Math.round(waterLiters / 40)} docce`,
        color: "#60C8F4",
      },
      {
        icon: "refresh-cw" as const,
        label: "Plastica evitata",
        value: `${plasticKg.toFixed(2)} kg`,
        sub: `≈ ${Math.round(plasticKg / 0.025)} bottiglie`,
        color: "#F4A462",
      },
      {
        icon: "shopping-bag" as const,
        label: "Prodotti green",
        value: `${greenProducts}`,
        sub: `su ${receiptsScanned} scontrini`,
        color: "#B5E48C",
      },
    ];

    return (
      <View ref={ref} style={styles.wrapper}>
        <LinearGradient
          colors={["#1A4331", "#2E6B50", "#3DA070"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circles */}
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />

          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo-leafy-white.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerRight}>
              <Text style={styles.headerApp}>Leafy</Text>
              <Text style={styles.headerTagline}>Sostenibilità rewards</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{emoji}</Text>
            <Text style={styles.heroLevel}>{level}</Text>
            {username ? (
              <Text style={styles.heroUsername}>@{username}</Text>
            ) : null}
            <Text style={styles.heroLabel}>Il mio impatto verde</Text>
          </View>

          {/* Metrics grid */}
          <View style={styles.grid}>
            {metrics.map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: m.color + "22" }]}>
                  <Feather name={m.icon} size={18} color={m.color} />
                </View>
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricSub}>{m.sub}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🌍 Unisciti a me su Leafy e fai la differenza
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

ImpactShareCard.displayName = "ImpactShareCard";

export default ImpactShareCard;

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
    overflow: "hidden",
  },
  circleTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  circleBottomLeft: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerRight: {
    flex: 1,
  },
  headerApp: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerTagline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
  },
  hero: {
    alignItems: "center",
    marginBottom: 22,
  },
  heroEmoji: {
    fontSize: 42,
    marginBottom: 4,
  },
  heroLevel: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: "#FFFFFF",
  },
  heroUsername: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  heroLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  metricCard: {
    width: (CARD_W - 48 - 10) / 2,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    padding: 12,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  metricValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  metricLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: "rgba(255,255,255,0.80)",
    marginTop: 2,
  },
  metricSub: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 10,
    color: "rgba(255,255,255,0.50)",
    marginTop: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 14,
    alignItems: "center",
  },
  footerText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
});
