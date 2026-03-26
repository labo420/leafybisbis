import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { Fonts } from "@/constants/typography";
import type { ThemeColors } from "@/constants/theme";
import { XpIcon } from "@/components/XpIcon";
import { useWalkin } from "@/hooks/useWalkin";
import type { NearbyLocation } from "@/hooks/useNearbyLocations";

const DWELL_RING_SIZE = 96;
const DWELL_RING_STROKE = 8;
const DWELL_RING_RADIUS = (DWELL_RING_SIZE - DWELL_RING_STROKE) / 2;
const DWELL_RING_CX = DWELL_RING_SIZE / 2;
const DWELL_RING_CY = DWELL_RING_SIZE / 2;
const DWELL_CIRCUMFERENCE = 2 * Math.PI * DWELL_RING_RADIUS;

function DwellRing({
  remaining,
  total,
  color,
  onCancel,
  theme,
}: {
  remaining: number;
  total: number;
  color: string;
  onCancel: () => void;
  theme: ThemeColors;
}) {
  const fraction = remaining / total;
  const dashOffset = DWELL_CIRCUMFERENCE * fraction;
  return (
    <View style={styles.dwellRingContainer}>
      <Svg width={DWELL_RING_SIZE} height={DWELL_RING_SIZE}>
        <Circle
          cx={DWELL_RING_CX}
          cy={DWELL_RING_CY}
          r={DWELL_RING_RADIUS}
          stroke={theme.border}
          strokeWidth={DWELL_RING_STROKE}
          fill="none"
        />
        <Circle
          cx={DWELL_RING_CX}
          cy={DWELL_RING_CY}
          r={DWELL_RING_RADIUS}
          stroke={color}
          strokeWidth={DWELL_RING_STROKE}
          fill="none"
          strokeDasharray={`${DWELL_CIRCUMFERENCE} ${DWELL_CIRCUMFERENCE}`}
          strokeDashoffset={DWELL_CIRCUMFERENCE - dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${DWELL_RING_CX} ${DWELL_RING_CY})`}
        />
      </Svg>
      <View style={[styles.dwellRingCenter, { height: DWELL_RING_SIZE }]}>
        <Text style={[styles.dwellRingSeconds, { color }]}>{remaining}</Text>
        <Text style={[styles.dwellRingLabel, { color: theme.textMuted }]}>sec</Text>
      </View>
      <Pressable style={[styles.cancelBtn, { borderColor: theme.border, marginTop: 8, alignSelf: "center" }]} onPress={onCancel}>
        <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Annulla</Text>
      </Pressable>
    </View>
  );
}

export function InStoreLocationCard({
  location,
  walkin,
  theme,
}: {
  location: NearbyLocation;
  walkin: ReturnType<typeof useWalkin>;
  theme: ThemeColors;
}) {
  const [clientCapReached, setClientCapReached] = useState(false);
  const checkDailyCapForLocation = walkin.checkDailyCapForLocation;

  useEffect(() => {
    checkDailyCapForLocation(location.id, location.walkinMaxPerDay, location.type).then(setClientCapReached).catch(() => {});
  }, [location.id, location.walkinMaxPerDay, location.type, walkin.phase, checkDailyCapForLocation]);

  const isActive = walkin.activeLocation?.id === location.id;
  const isStarting = isActive && walkin.phase === "starting";
  const isDwelling = isActive && walkin.phase === "dwelling";
  const isSubmitting = isActive && walkin.phase === "submitting";
  const isRewarded = isActive && walkin.phase === "rewarded";
  const isDone = (isActive && walkin.phase === "already_done") || (!isActive && clientCapReached);
  const isError = isActive && walkin.phase === "error";
  const isOasi = location.type === "oasi";

  return (
    <View style={[styles.locationCard, { borderColor: isOasi ? "#A78BFA" : theme.border, borderWidth: isOasi ? 1.5 : 1 }]}>
      <View style={styles.locationHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.locationNameRow}>
            {isOasi && (
              <View style={styles.oasiBadge}>
                <Text style={styles.oasiBadgeText}>OASI</Text>
              </View>
            )}
            <Text style={[styles.locationName, { color: theme.text }]}>{location.name}</Text>
          </View>
          <Text style={[styles.locationDist, { color: theme.textMuted }]}>
            {location.distanceM < 50
              ? "Sei qui!"
              : location.distanceM < 1000
              ? `${Math.round(location.distanceM)} m di distanza`
              : `${(location.distanceM / 1000).toFixed(1)} km di distanza`}
          </Text>
          <Text style={[styles.locationCap, { color: theme.textMuted }]}>
            {`Max ${location.walkinMaxPerDay}x al giorno · ${location.walkinDrops} drops`}
          </Text>
        </View>
        <View style={[styles.dropsBubble, { backgroundColor: isOasi ? "rgba(167,139,250,0.12)" : theme.primaryLight, flexDirection: "row", alignItems: "center", gap: 3 }]}>
          <Text style={[styles.dropsBubbleText, { color: isOasi ? "#7C3AED" : theme.leaf }]}>
            +{location.walkinDrops}
          </Text>
          <XpIcon size={16} />
        </View>
      </View>

      {isDwelling && (
        <DwellRing
          remaining={walkin.dwellRemaining}
          total={walkin.dwellTotal}
          color={isOasi ? "#7C3AED" : theme.leaf}
          onCancel={walkin.cancelDwell}
          theme={theme}
        />
      )}

      {(isRewarded || isDone) && (
        <View style={[styles.rewardRow, { backgroundColor: isRewarded ? "rgba(81,184,136,0.12)" : theme.primaryLight }]}>
          <MaterialCommunityIcons
            name={isRewarded ? "check-circle" : "clock-check-outline"}
            size={16}
            color={isRewarded ? "#51B888" : theme.textMuted}
          />
          {isRewarded ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={[styles.rewardText, { color: "#51B888" }]}>
                {`+${walkin.result?.dropsAwarded}`}
              </Text>
              <XpIcon size={13} />
              <Text style={[styles.rewardText, { color: "#51B888" }]}> guadagnati!</Text>
            </View>
          ) : (
            <Text style={[styles.rewardText, { color: theme.textMuted }]}>Già completato oggi</Text>
          )}
        </View>
      )}

      {isActive && location.challenges.length > 0 && isDwelling && (
        <View style={styles.challengesSection}>
          <Text style={[styles.challengesTitle, { color: theme.textSecondary }]}>Sfide in negozio</Text>
          {location.challenges.map((ch) => (
            <Pressable
              key={ch.id}
              style={[styles.challengeRow, { backgroundColor: theme.primaryLight }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/barcode-scanner",
                  params: { mode: "discovery", locationId: String(location.id), challengeId: String(ch.id), productName: ch.name },
                });
              }}
            >
              <MaterialCommunityIcons name="barcode-scan" size={16} color={theme.leaf} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.challengeName, { color: theme.text }]}>{ch.name}</Text>
                {ch.description && (
                  <Text style={[styles.challengeDesc, { color: theme.textMuted }]}>{ch.description}</Text>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={[styles.challengeDrops, { color: theme.leaf }]}>+{ch.dropsReward}</Text>
                <XpIcon size={14} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!isDwelling && !isActive && location.challenges.length > 0 && (
        <View style={styles.challengesSection}>
          <Text style={[styles.challengesTitle, { color: theme.textSecondary }]}>Sfide disponibili</Text>
          {location.challenges.map((ch) => (
            <View key={ch.id} style={[styles.challengeRow, { backgroundColor: theme.primaryLight, opacity: 0.55 }]}>
              <MaterialCommunityIcons name="barcode-scan" size={16} color={theme.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.challengeName, { color: theme.textMuted }]}>{ch.name}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={[styles.challengeDrops, { color: theme.textMuted }]}>+{ch.dropsReward}</Text>
                <XpIcon size={14} />
              </View>
            </View>
          ))}
          <Text style={[styles.challengeHint, { color: theme.textMuted }]}>Entra nel negozio per sbloccare le sfide</Text>
        </View>
      )}

      {isError && (
        <View style={styles.submittingRow}>
          <Feather name="alert-circle" size={14} color={theme.amber} />
          <Text style={[styles.submittingText, { color: theme.amber }]}>{walkin.errorMsg ?? "Errore"}</Text>
          <Pressable onPress={walkin.reset}>
            <Text style={{ color: theme.leaf, fontSize: 12, fontFamily: Fonts.bodyBold }}>Riprova</Text>
          </Pressable>
        </View>
      )}

      {(isStarting || isSubmitting) && (
        <View style={styles.submittingRow}>
          <ActivityIndicator size="small" color={theme.leaf} />
          <Text style={[styles.submittingText, { color: theme.textSecondary }]}>
            {isStarting ? "Avvio sessione…" : "Registrazione walk-in…"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    backgroundColor: "transparent",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  locationNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  oasiBadge: {
    backgroundColor: "#7C3AED",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  oasiBadgeText: {
    fontSize: 9,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 15,
    fontFamily: "DMSans_600SemiBold",
  },
  locationDist: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  locationCap: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    opacity: 0.65,
  },
  dropsBubble: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropsBubbleText: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
  },
  dwellRingContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dwellRingCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dwellRingSeconds: {
    fontSize: 22,
    fontFamily: "DMSans_700Bold",
  },
  dwellRingLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: -2,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  rewardText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  challengesSection: {
    gap: 6,
  },
  challengesTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  challengeName: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  challengeDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  challengeDrops: {
    fontSize: 12,
    fontFamily: "DMSans_700Bold",
  },
  challengeHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 6,
    opacity: 0.7,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  submittingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
