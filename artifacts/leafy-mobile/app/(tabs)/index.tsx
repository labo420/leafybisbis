import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import BadgeIcon3D from "@/components/BadgeIcon3D";
import { XpIcon } from "../../components/XpIcon";
import { LeaIcon } from "../../components/LeaIcon";
import { GoogleIcon } from "../../components/GoogleIcon";
import { FacebookIcon } from "../../components/FacebookIcon";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Redirect, router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  cancelAnimation,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notifications";
import { useTheme } from "@/context/theme";
import { apiFetch } from "@/lib/api";
import { useNearbyLocations, type NearbyLocation } from "@/hooks/useNearbyLocations";
import { useWalkin } from "@/hooks/useWalkin";
import type { Profile, DailyCheckinResponse, Challenge } from "@workspace/api-client-react";
import LeafyGoldModal from "@/components/LeafyGoldModal";
import CheckinDropBurst from "@/components/CheckinDropBurst";
import { useLevelUp } from "@/context/level-up";

const LEVEL_LABELS: Record<string, string> = {
  Germoglio: "Germoglio",
  Ramoscello: "Ramoscello",
  Arbusto: "Arbusto",
  Albero: "Albero",
  Foresta: "Foresta",
  Giungla: "Giungla",
};

const LEVEL_CONFIG = [
  { name: "Germoglio", emoji: "🌱", minPts: 0, color: "#8BC34A", fruitColor: "#8BC34A", nodeSize: 26, imgSize: 26 },
  { name: "Ramoscello", emoji: "🌿", minPts: 500, color: "#66BB6A", fruitColor: "#8BC34A", nodeSize: 36, imgSize: 36 },
  { name: "Arbusto", emoji: "🍃", minPts: 2000, color: "#43A047", fruitColor: "#F4D03F", nodeSize: 48, imgSize: 48 },
  { name: "Albero", emoji: "🌳", minPts: 5000, color: "#2E7D32", fruitColor: "#FF8C42", nodeSize: 62, imgSize: 62 },
  { name: "Foresta", emoji: "🌲", minPts: 10000, color: "#1B5E20", fruitColor: "#E74C3C", nodeSize: 78, imgSize: 78 },
  { name: "Giungla", emoji: "🌴", minPts: 25000, color: "#004D25", fruitColor: "#FFD700", nodeSize: 90, imgSize: 90 },
];



const RING_SIZE = 240;
const RING_STROKE = 16;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const N_SEGS = 60;

const SWEEP_STOPS: { t: number; r: number; g: number; b: number }[] = [
  { t: 0,    r: 170, g: 223, b: 42  },
  { t: 0.33, r: 255, g: 214, b: 0   },
  { t: 0.67, r: 255, g: 107, b: 0   },
  { t: 1,    r: 245, g: 59,  b: 59  },
];

function sweepColor(t: number): string {
  t = Math.max(0, Math.min(1, t));
  let lo = SWEEP_STOPS[0];
  let hi = SWEEP_STOPS[SWEEP_STOPS.length - 1];
  for (let i = 0; i < SWEEP_STOPS.length - 1; i++) {
    if (t <= SWEEP_STOPS[i + 1].t) {
      lo = SWEEP_STOPS[i];
      hi = SWEEP_STOPS[i + 1];
      break;
    }
  }
  const f = hi.t > lo.t ? (t - lo.t) / (hi.t - lo.t) : 0;
  return `rgb(${Math.round(lo.r + f * (hi.r - lo.r))},${Math.round(lo.g + f * (hi.g - lo.g))},${Math.round(lo.b + f * (hi.b - lo.b))})`;
}

function arcSegPath(a1: number, a2: number): string {
  const x1 = (RING_CX + RING_RADIUS * Math.cos(a1)).toFixed(3);
  const y1 = (RING_CY + RING_RADIUS * Math.sin(a1)).toFixed(3);
  const x2 = (RING_CX + RING_RADIUS * Math.cos(a2)).toFixed(3);
  const y2 = (RING_CY + RING_RADIUS * Math.sin(a2)).toFixed(3);
  return `M ${x1} ${y1} A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${x2} ${y2}`;
}

const LEVEL_MCI_ICONS: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
  Germoglio: "sprout",
  Ramoscello: "leaf",
  Arbusto: "leaf-maple",
  Albero: "tree",
  Foresta: "forest",
  Giungla: "palm-tree",
};

const BP_PRIZES_DISPLAY = [
  { type: "drops" as const, label: "50" },
  { type: "lea" as const, label: "5 LEA" },
  { type: "drops" as const, label: "75" },
  { type: "lea" as const, label: "8 LEA" },
  { type: "drops" as const, label: "100" },
  { type: "lea" as const, label: "10 LEA" },
  { type: "both" as const, label: "150+15" },
];

const ICON_BASE_SIZE = 90;
const ICON_MIN_SCALE = 0.75;
const ICON_MAX_SCALE = 1.0;
const CAN_TOP = 32;
const CAN_LEFT = RING_SIZE / 2 + 12;
const CAN_PIVOT = 17;
const DROP_TOP = 62;
const DROP_LEFT = RING_SIZE / 2 + 14;
const DROP_TRAVEL = 50;

function LevelProgressRing({
  progress,
  level,
  points,
  nextLevelPoints: apiNextLevelPoints,
}: {
  progress: number;
  level: string;
  points: number;
  nextLevelPoints: number;
}) {
  const { mode } = useTheme();
  const { levelUpPhase, levelUpToLevel, setRingLayout } = useLevelUp();
  const onDark = mode === "dark";
  const trackColor = onDark ? "rgba(255,255,255,0.15)" : "rgba(46,107,80,0.13)";
  const borderColor = onDark ? "rgba(255,255,255,0.20)" : "rgba(46,107,80,0.22)";
  const nameColor = onDark ? "rgba(255,255,255,0.85)" : "#1A3028";
  const nextLvlColor = onDark ? "rgba(255,255,255,0.70)" : "rgba(26,48,40,0.60)";

  // ── Ring entry spring ──
  const ringScale = useSharedValue(0.82);
  useEffect(() => {
    ringScale.value = withSpring(1, { damping: 14, stiffness: 90 });
  }, [progress]);
  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  // ── Badge icon size scales with progress ──
  const targetIconScale = ICON_MIN_SCALE + (progress / 100) * (ICON_MAX_SCALE - ICON_MIN_SCALE);
  const iconScale = useSharedValue(targetIconScale);
  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // ── Badge level cross-fade ──
  const prevLevelRef = useRef(level);
  const [displayedLevel, setDisplayedLevel] = useState(level);
  const badgeOpacity = useSharedValue(1);
  const badgeVScale = useSharedValue(1);
  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeVScale.value }],
  }));

  // ── Ring badge position measurement (for modal suck animation) ──
  const ringBadgeRef = useRef<View>(null);
  const handleBadgeLayout = useCallback(() => {
    setTimeout(() => {
      (ringBadgeRef.current as any)?.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          if (width > 0 && height > 0) {
            setRingLayout({ x, y, width, height });
          }
        },
      );
    }, 80);
  }, [setRingLayout]);

  // ── Watering can animation ──
  const prevPointsRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  // ── Animated progress bar ──
  const [displayProgress, setDisplayProgress] = useState(progress);
  const displayProgressRef = useRef(progress);
  const rafRef = useRef<number | null>(null);
  const progTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hapticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateProgress = useCallback((from: number, to: number, durationMs = 700) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + eased * (to - from);
      displayProgressRef.current = val;
      setDisplayProgress(val);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const canOpacity = useSharedValue(0);
  const canRotate = useSharedValue(0);
  const dropOpacity = useSharedValue(0);
  const dropY = useSharedValue(0);

  const canAnimStyle = useAnimatedStyle(() => ({
    opacity: canOpacity.value,
    transform: [
      { translateX: CAN_PIVOT },
      { translateY: CAN_PIVOT },
      { rotate: `${canRotate.value}deg` },
      { translateX: -CAN_PIVOT },
      { translateY: -CAN_PIVOT },
      { scaleX: -1 },
    ],
  }));
  const dropAnimStyle = useAnimatedStyle(() => ({
    opacity: dropOpacity.value,
    transform: [{ translateY: dropY.value }],
  }));

  // ── Main animation logic ──
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevPointsRef.current = points;
      prevLevelRef.current = level;
      return;
    }

    const prev = prevPointsRef.current ?? points;
    const prevLev = prevLevelRef.current;
    prevPointsRef.current = points;
    prevLevelRef.current = level;

    const newIconScale = ICON_MIN_SCALE + (progress / 100) * (ICON_MAX_SCALE - ICON_MIN_SCALE);

    // ── Branch A: livello cambiato E nuovi drops ──
    // Annafiatoio → barra al 100% → crescendo → modal (gestita da context)
    // Il badge swap avviene solo dopo la chiusura del modal (phase="exploded")
    if (prevLev !== level && points > prev && prev > 0) {
      if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
      if (hapticTimeoutRef.current) clearTimeout(hapticTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const oldP = displayProgressRef.current;

      // Watering can: fade in (450ms), hold (1750ms), fade out (500ms) → 2700ms totali
      canOpacity.value = withSequence(
        withTiming(1, { duration: 450 }),
        withTiming(1, { duration: 1750 }),
        withTiming(0, { duration: 500 }),
      );
      // Can inclina 35° per versare poi ritorna
      canRotate.value = withSequence(
        withTiming(0, { duration: 100 }),
        withTiming(35, { duration: 750, easing: Easing.out(Easing.quad) }),
        withTiming(35, { duration: 700 }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      );
      // Goccia: attesa 950ms, appare 120ms, cade 900ms, svanisce 300ms
      dropOpacity.value = withSequence(
        withTiming(0, { duration: 950 }),
        withTiming(1, { duration: 120 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 300 }),
      );
      dropY.value = withSequence(
        withTiming(0, { duration: 950 }),
        withTiming(DROP_TRAVEL, { duration: 1020, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      );

      // Haptic all'atterraggio goccia (1970ms)
      hapticTimeoutRef.current = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 1970);
      // Barra va al 100% (non al valore reale — avverrà dopo il modal in phase=exploded)
      progTimeoutRef.current = setTimeout(() => animateProgress(oldP, 100), 1970);

      // Crescendo badge: 12 cicli con ampiezza crescente (±3%→±35%) e periodo decrescente
      // Totale ~2530ms + fine animation ~170ms ≈ 2700ms
      badgeVScale.value = withSequence(
        withTiming(1.03, { duration: 175, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 175, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.06, { duration: 158, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 158, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.09, { duration: 142, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 142, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.13, { duration: 128, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 128, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.16, { duration: 115, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 115, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.20, { duration: 104, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 104, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.23, { duration:  93, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  93, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.26, { duration:  84, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  84, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.29, { duration:  76, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  76, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.32, { duration:  69, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  69, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.35, { duration:  63, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  63, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.35, { duration:  58, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration:  58, easing: Easing.inOut(Easing.ease) }),
        // Fine: compressione prima dell'esplosione
        withTiming(0.42, { duration: 170, easing: Easing.out(Easing.quad) }),
      );
      // badge opacity: resta visibile, poi si nasconde al momento giusto
      badgeOpacity.value = 1;

      return () => {
        if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
        if (hapticTimeoutRef.current) clearTimeout(hapticTimeoutRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    // ── Branch B: livello cambiato senza nuovi drops (es. ripristino app) ──
    // La barra va al 100%, poi il badge swap avverrà via phase="exploded"
    if (prevLev !== level) {
      if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const oldP = displayProgressRef.current;
      progTimeoutRef.current = setTimeout(() => animateProgress(oldP, 100, 500), 200);
      return () => {
        if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
      };
    }

    // ── Branch C: solo nuovi drops, nessun cambio livello ──
    if (points > prev && prev > 0) {
      if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
      if (hapticTimeoutRef.current) clearTimeout(hapticTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const oldP = displayProgressRef.current;
      const newP = progress;

      canOpacity.value = withSequence(
        withTiming(1, { duration: 450 }),
        withTiming(1, { duration: 1750 }),
        withTiming(0, { duration: 500 }),
      );
      canRotate.value = withSequence(
        withTiming(0, { duration: 100 }),
        withTiming(35, { duration: 750, easing: Easing.out(Easing.quad) }),
        withTiming(35, { duration: 700 }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      );
      dropOpacity.value = withSequence(
        withTiming(0, { duration: 950 }),
        withTiming(1, { duration: 120 }),
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 300 }),
      );
      dropY.value = withSequence(
        withTiming(0, { duration: 950 }),
        withTiming(DROP_TRAVEL, { duration: 1020, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      );

      badgeOpacity.value = withDelay(1920, withSequence(
        withTiming(0.5, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
      ));
      iconScale.value = withDelay(
        1970,
        withSpring(newIconScale, { damping: 6, stiffness: 130, mass: 0.8 }),
      );
      hapticTimeoutRef.current = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 1970);
      progTimeoutRef.current = setTimeout(() => animateProgress(oldP, newP), 1970);
    } else {
      displayProgressRef.current = progress;
      setDisplayProgress(progress);
      iconScale.value = withSpring(newIconScale, { damping: 12, stiffness: 80 });
    }

    return () => {
      if (progTimeoutRef.current) clearTimeout(progTimeoutRef.current);
      if (hapticTimeoutRef.current) clearTimeout(hapticTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [points, progress, level]);

  // ── Phase "exploded": il modal ha finito → swap badge + barra al valore reale ──
  useEffect(() => {
    if (levelUpPhase !== "exploded" || !levelUpToLevel) return;

    const newIconScale = ICON_MIN_SCALE + (progress / 100) * (ICON_MAX_SCALE - ICON_MIN_SCALE);

    // Haptic Heavy per enfatizzare il reveal
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Nascondi immediatamente il badge prima dello swap per evitare flash
    badgeOpacity.value = 0;
    badgeVScale.value = 0.25;

    // Swap badge (si aggiorna al nuovo livello mentre è nascosto)
    setDisplayedLevel(levelUpToLevel);

    // Barra riparte da 0%
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    displayProgressRef.current = 0;
    setDisplayProgress(0);

    // Al frame successivo: rivela il nuovo badge con animazione bounce
    const revealTimer = setTimeout(() => {
      badgeOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
      badgeVScale.value = withSpring(1, { damping: 7, stiffness: 130 });
      iconScale.value = withDelay(150, withSpring(newIconScale, { damping: 10, stiffness: 90 }));
    }, 50);

    // Barra avanza al valore reale del nuovo livello (con leggero ritardo)
    const progressTimer = setTimeout(() => {
      animateProgress(0, progress, 950);
    }, 300);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(progressTimer);
    };
  }, [levelUpPhase, levelUpToLevel]);

  const currentIdx = LEVEL_CONFIG.findIndex(l => l.name === level);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;
  const isMaxLevel = safeIdx >= LEVEL_CONFIG.length - 1;
  const nextLevel = isMaxLevel ? null : LEVEL_CONFIG[safeIdx + 1];
  const pointsRemaining = isMaxLevel ? 0 : Math.max(0, apiNextLevelPoints - points);
  const targetPts = isMaxLevel ? LEVEL_CONFIG[safeIdx].minPts : apiNextLevelPoints;

  const totalAngle = (displayProgress / 100) * 2 * Math.PI;
  const segAngle = N_SEGS > 0 ? totalAngle / N_SEGS : 0;
  const endCapX = RING_CX + RING_RADIUS * Math.cos(totalAngle);
  const endCapY = RING_CY + RING_RADIUS * Math.sin(totalAngle);

  const levelIcon = LEVEL_MCI_ICONS[level] ?? "sprout";

  return (
    <Animated.View style={[ringStyles.outerContainer, containerAnimStyle]}>
      <View style={ringStyles.container}>
        <Svg width={RING_SIZE} height={RING_SIZE} overflow="visible" style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_RADIUS}
            stroke={trackColor}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          {displayProgress > 0 && Array.from({ length: N_SEGS }, (_, i) => {
            const a1 = i * segAngle;
            const a2 = (i + 1) * segAngle;
            const t = (i + 0.5) * displayProgress / (100 * N_SEGS);
            return (
              <Path
                key={i}
                d={arcSegPath(a1, a2)}
                stroke={sweepColor(t)}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeLinecap="butt"
              />
            );
          })}
          {displayProgress > 0 && displayProgress < 100 && (
            <Circle
              cx={endCapX}
              cy={endCapY}
              r={RING_STROKE / 2}
              fill={sweepColor(displayProgress / 100)}
            />
          )}
        </Svg>

        {/* Outer border ring — native View, always continuous on Android */}
        <View style={[ringStyles.outerBorder, { borderColor }]} />
        {/* Inner border ring — native View, always continuous on Android */}
        <View style={[ringStyles.innerBorder, { borderColor }]} />

        {/* Center: badge icon + text */}
        <View style={ringStyles.innerContent}>
          <Animated.View
            ref={ringBadgeRef as any}
            onLayout={handleBadgeLayout}
            style={badgeAnimStyle}
          >
            <Animated.View style={iconAnimStyle}>
              <BadgeIcon3D name={displayedLevel} category="Livello" emoji="" isUnlocked={true} size={ICON_BASE_SIZE} />
            </Animated.View>
          </Animated.View>
          <Text style={[ringStyles.levelName, { color: nameColor }]}>{LEVEL_LABELS[displayedLevel] ?? displayedLevel}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={[ringStyles.xpProgress, { color: "#38BDF8" }]}>
              {new Intl.NumberFormat("it-IT").format(points)} / {new Intl.NumberFormat("it-IT").format(targetPts)}
            </Text>
            <XpIcon size={22} />
          </View>
        </View>

        {/* Watering can overlay */}
        <Animated.Image
          source={require("@/assets/images/watering-can-icon.png")}
          style={[ringStyles.wateringCan, canAnimStyle, { width: 52, height: 52 }]}
          resizeMode="contain"
        />

        {/* Droplet */}
        <Animated.Image
          source={require("@/assets/images/drop-anim.png")}
          style={[ringStyles.droplet, dropAnimStyle]}
          resizeMode="contain"
        />
      </View>

      <Text style={[ringStyles.nextLevelText, { color: nextLvlColor }]} numberOfLines={3}>
        {isMaxLevel
          ? "Hai raggiunto il massimo livello!"
          : `Ti mancano solo ${new Intl.NumberFormat("it-IT").format(pointsRemaining)} drops per sbloccare ${nextLevel!.name} e ottenere i nuovi vantaggi.`}
      </Text>
    </Animated.View>
  );
}

const ringStyles = StyleSheet.create({
  outerContainer: {
    alignItems: "center",
    paddingBottom: 4,
  },
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  innerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  levelName: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.4,
    marginTop: 2,
  },
  xpProgress: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  nextLevelText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  wateringCan: {
    position: "absolute",
    top: CAN_TOP,
    left: CAN_LEFT,
    zIndex: 10,
  },
  droplet: {
    position: "absolute",
    top: DROP_TOP,
    left: DROP_LEFT - 7,
    width: 18,
    height: 24,
    zIndex: 10,
  },
  outerBorder: {
    position: "absolute",
    width: 243,
    height: 243,
    borderRadius: 121.5,
    borderWidth: 2,
    top: -1.5,
    left: -1.5,
  },
  innerBorder: {
    position: "absolute",
    width: 205,
    height: 205,
    borderRadius: 102.5,
    borderWidth: 2,
    top: 17.5,
    left: 17.5,
  },
});

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionSection = "login" | "register" | null;

function GuestAuthScreen() {
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();

  const [expanded, setExpanded] = useState<AccordionSection>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSection = (section: "login" | "register") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setError(null);
    setEmail("");
    setPassword("");
    setUsername("");
    setShowPassword(false);
    setExpanded((prev) => (prev === section ? null : section));
  };

  const handleSubmit = async () => {
    if (!expanded) return;
    setError(null);
    if (!email.trim() || !password) {
      setError("Inserisci email e password.");
      return;
    }
    if (expanded === "register" && !username.trim()) {
      setError("Inserisci un nome utente.");
      return;
    }
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = expanded === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = expanded === "login"
        ? { email, password }
        : { email, password, username };
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Si è verificato un errore.");
        return;
      }
      if (data.user) {
        setUser(data.user);
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = (section: "login" | "register") => (
    <View style={authStyles.accordionBody}>
      {section === "register" && (
        <View style={authStyles.inputWrap}>
          <Feather name="user" size={16} color="rgba(255,255,255,0.5)" style={authStyles.inputIcon} />
          <TextInput
            style={authStyles.input}
            placeholder="Nome utente"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      <View style={authStyles.inputWrap}>
        <Feather name="mail" size={16} color="rgba(255,255,255,0.5)" style={authStyles.inputIcon} />
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
        />
      </View>

      <View style={authStyles.inputWrap}>
        <Feather name="lock" size={16} color="rgba(255,255,255,0.5)" style={authStyles.inputIcon} />
        <TextInput
          style={[authStyles.input, { flex: 1 }]}
          placeholder="Password (min. 8 caratteri)"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          textContentType={section === "login" ? "password" : "newPassword"}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
          <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      {error && (
        <View style={authStyles.errorBox}>
          <Feather name="alert-circle" size={14} color="#FCA5A5" />
          <Text style={authStyles.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [authStyles.submitBtn, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#2E6B50" />
        ) : (
          <Text style={authStyles.submitBtnText}>Conferma</Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <View style={[authStyles.screen, { paddingTop: 0, paddingBottom: insets.bottom }]}>
      <View style={authStyles.decoCircle1} />
      <View style={authStyles.decoCircle2} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.logoSection}>
            <Image
              source={require("@/assets/images/leafy-logo-dark.png")}
              style={expanded ? authStyles.logoSmall : authStyles.logo}
              resizeMode="contain"
            />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Feather name="gift" size={16} color={Colors.primary} />
              <Text style={authStyles.tagline}>La tua spesa di ogni giorno,{"\n"}premiata.</Text>
            </View>
          </View>

          <View style={authStyles.actions}>
            {expanded !== "register" && (
              <Pressable
                style={({ pressed }) => [
                  authStyles.primaryBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => toggleSection("login")}
              >
                <Text style={authStyles.primaryBtnText}>Accedi</Text>
              </Pressable>
            )}

            {expanded === "login" && renderFormFields("login")}

            {expanded !== "login" && (
              <Pressable
                style={({ pressed }) => [
                  authStyles.outlineBtn,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => toggleSection("register")}
              >
                <Text style={authStyles.outlineBtnText}>Crea account</Text>
              </Pressable>
            )}

            {expanded === "register" && renderFormFields("register")}

            <View style={authStyles.divider}>
              <View style={authStyles.dividerLine} />
              <Text style={authStyles.dividerText}>oppure</Text>
              <View style={authStyles.dividerLine} />
            </View>

            <Pressable onPress={() => {}} style={({ pressed }) => [authStyles.googleBtn, pressed && { opacity: 0.9 }]}>
              <GoogleIcon size={22} />
              <Text style={authStyles.googleBtnText}>Continua con Google</Text>
            </Pressable>

            <Pressable onPress={() => {}} style={({ pressed }) => [authStyles.fbBtn, pressed && { opacity: 0.9 }]}>
              <FacebookIcon size={22} />
              <Text style={authStyles.fbBtnText}>Continua con Facebook</Text>
            </Pressable>

            <Text style={authStyles.footer}>Ogni scelta sostenibile ti premia</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChallengeCard({ challenge: ch, theme }: { challenge: Challenge; theme: ReturnType<typeof useTheme>["theme"] }) {
  const pct = ch.progressPercent;
  const isCompleted = ch.isCompleted;
  const typeLabel = ch.challengeType === "daily" ? "Giornaliera" : "Settimanale";
  const typeColor = ch.challengeType === "daily" ? "#38BDF8" : "#51B888";

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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
    letterSpacing: -0.2,
  },
  subLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
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
    fontFamily: "DMSans_700Bold",
    flex: 1,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "DMSans_700Bold",
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
    fontFamily: "DMSans_700Bold",
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
    fontFamily: "DMSans_700Bold",
  },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme, mode } = useTheme();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/profile"),
    enabled: !!user,
  });

  const { data: impact, refetch: refetchImpact } = useQuery<{
    receiptsScanned: number;
    greenProductsCount: number;
    co2SavedKg: number;
  }>({
    queryKey: ["profile/impact"],
    queryFn: () => apiFetch("/profile/impact"),
    enabled: !!user,
  });

  const { data: challenges, refetch: refetchChallenges } = useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: () => apiFetch("/challenges"),
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const [streakToast, setStreakToast] = React.useState<{
    loginStreak: number;
    bonusAwarded: boolean;
    dropsBonus: number;
    bpPrize: { drops: number; lea: number } | null;
  } | null>(null);

  const [inStoreModeEnabled, setInStoreModeEnabled] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinKey, setCheckinKey] = useState(0);
  const [inStoreModeActive, setInStoreModeActive] = useState(false);
  const [walkinToast, setWalkinToast] = useState<{ locationName: string; drops: number } | null>(null);
  const [showLeafyGoldModal, setShowLeafyGoldModal] = useState(false);
  const { pushEnabled } = useNotifications();

  const { locations, permissionStatus, loading: locationsLoading, refresh: refreshLocations } =
    useNearbyLocations(inStoreModeEnabled && !!user);

  const walkin = useWalkin(locations, pushEnabled);

  useEffect(() => {
    if (!user) return;
    if (inStoreModeEnabled) {
      walkin.startGeofenceWatch();
    } else {
      walkin.stopGeofenceWatch();
      walkin.reset();
      setInStoreModeActive(false);
    }
  }, [inStoreModeEnabled, user?.id]);

  useEffect(() => {
    if (!user || !inStoreModeEnabled) return;
    if (walkin.isInsideStore) {
      setInStoreModeActive(true);
    } else if (!walkin.isInsideStore && walkin.phase === "idle") {
      setInStoreModeActive(false);
    }
  }, [walkin.isInsideStore, walkin.phase, inStoreModeEnabled, user?.id]);

  useEffect(() => {
    if (walkin.phase === "rewarded" && walkin.result) {
      setWalkinToast({ locationName: walkin.result.locationName, drops: walkin.result.dropsAwarded });
      setTimeout(() => setWalkinToast(null), 4000);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      refetchProfile();
    }
  }, [walkin.phase]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) refetchProfile();
    }, [user?.id])
  );


  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchImpact(), refetchChallenges()]);
    setRefreshing(false);
  };

  const scanButtonScale = useSharedValue(1);
  const scanAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanButtonScale.value }],
  }));

  const handleScanPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scanButtonScale.value = withSpring(0.95, {}, () => {
      scanButtonScale.value = withSpring(1);
    });
    router.push("/(tabs)/scan");
  };

  const confettiDist = useSharedValue(0);
  const confettiAlpha = useSharedValue(0);
  const checkinBtnScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const cellBounce = useSharedValue(1);
  const combinedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkinBtnScale.value * pulseScale.value }],
  }));
  const cellBounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cellBounce.value }],
  }));

  const _checkedInTodayForEffect = !!(profile?.lastLoginDate &&
    new Date(profile.lastLoginDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!profile) return;
    if (!_checkedInTodayForEffect) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [_checkedInTodayForEffect, !!profile]);

  const handleCheckin = async () => {
    if (checkingIn) return;
    setCheckingIn(true);
    setCheckinKey(k => k + 1);
    checkinBtnScale.value = withSequence(
      withSpring(0.88, { damping: 10, stiffness: 320 }),
      withSpring(1.10, { damping: 9, stiffness: 260 }),
      withSpring(1, { damping: 14, stiffness: 200 })
    );
    confettiDist.value = 0;
    confettiAlpha.value = 0;
    confettiDist.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    confettiAlpha.value = withSequence(
      withTiming(1, { duration: 60 }),
      withDelay(140, withTiming(0, { duration: 500 }))
    );
    cellBounce.value = withSpring(1.4, { damping: 8, stiffness: 400 }, () => {
      cellBounce.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
    try {
      const data: DailyCheckinResponse = await apiFetch("/profile/daily-checkin", { method: "POST" });
      if (!data.alreadyCheckedIn) {
        setStreakToast({
          loginStreak: data.loginStreak,
          bonusAwarded: data.bonusAwarded,
          dropsBonus: data.dropsBonus,
          bpPrize: data.bpPrize ?? null,
        });
        setTimeout(() => setStreakToast(null), 4500);
        refetchProfile();
      }
    } catch {} finally {
      setCheckingIn(false);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 100 + insets.bottom;

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (profileLoading) {
    return (
      <View style={[styles.centered, { paddingTop: topPadding, backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.leaf} />
        <Text style={{ marginTop: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: theme.textSecondary, textAlign: "center" }}>Caricamento...</Text>
      </View>
    );
  }

  const { width: screenWidth } = useWindowDimensions();
  // stampCardShadow: marginHorizontal 16 each side (32) + stampCard: padding 16 each side (32) = 64px total
  const cellSize = Math.floor((screenWidth - 64) / 7) - 4;

  const username = profile?.username || user?.firstName || "Utente";
  const streak = profile?.streak ?? 0;
  const loginStreak = profile?.loginStreak ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = !!(profile?.lastLoginDate &&
    new Date(profile.lastLoginDate).toISOString().slice(0, 10) === today);
  const hasLeafyGold = profile?.hasLeafyGold ?? false;
  const bpStreakDay = profile?.bpStreakDay ?? 0;
  const bpStreakClaimed = profile?.bpStreakClaimed ?? 0;
  const bpStreakCompleted = profile?.bpStreakCompleted ?? false;
  const drops = profile?.drops ?? profile?.totalPoints ?? 0;
  const leaBalance = profile?.leaBalance ?? 0;
  const points = drops;
  const level = profile?.level ?? "Germoglio";
  const levelProgress = Math.max(0, Math.min(100, profile?.levelProgress ?? 0));
  const nextLevelPoints = profile?.nextLevelPoints ?? 0;
  const safeInitial = (username.trim().charAt(0) || "U").toUpperCase();

  return (
    <View style={{ flex: 1 }}>
    {streakToast && (
      <Animated.View
        entering={FadeInDown.springify()}
        style={[streakStyles.toast, { top: topPadding + 12, backgroundColor: "#1A3028" }]}
      >
        <MaterialCommunityIcons
          name={streakToast.bonusAwarded ? "trophy" : streakToast.bpPrize ? "shield-star" : "fire"}
          size={22}
          color={streakToast.bonusAwarded ? "#FACC15" : streakToast.bpPrize ? "#A78BFA" : "#F97316"}
        />
        <View style={{ flex: 1 }}>
          <Text style={streakStyles.toastTitle}>
            {streakToast.bonusAwarded
              ? "Streak completata!"
              : streakToast.bpPrize
              ? "Leafy Gold — Premio!"
              : `Streak: giorno ${streakToast.loginStreak}`}
          </Text>
          {streakToast.bonusAwarded ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={streakStyles.toastSub}>7 giorni consecutivi! +{streakToast.dropsBonus}</Text>
              <XpIcon size={12} />
            </View>
          ) : streakToast.bpPrize ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              {streakToast.bpPrize.drops > 0 && (
                <>
                  <Text style={streakStyles.toastSub}>+{streakToast.bpPrize.drops}</Text>
                  <XpIcon size={12} />
                </>
              )}
              {streakToast.bpPrize.lea > 0 && (
                <Text style={streakStyles.toastSub}>{streakToast.bpPrize.drops > 0 ? "  " : ""}+{streakToast.bpPrize.lea} $LEA</Text>
              )}
            </View>
          ) : (
            <Text style={streakStyles.toastSub}>
              {streakToast.loginStreak === 1
                ? "Ottimo inizio! Torna domani."
                : `${7 - streakToast.loginStreak} giorni al prossimo premio.`}
            </Text>
          )}
        </View>
      </Animated.View>
    )}
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      {/* ── HERO SECTION ── */}
      <View
        style={[
          styles.heroSection,
          { backgroundColor: mode === "dark" ? "#142A20" : "#F2F9F5" }
        ]}
      >
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBoxHero}>
              <Image
                source={require("@/assets/leafy-icon-dark.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={[styles.greetingHero, { color: mode === "dark" ? "rgba(255,255,255,0.85)" : "#1A3028" }]}>Ciao, {username}! 👋</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push("/(tabs)/profilo")}>
              <View style={[styles.avatarCircleHero, { backgroundColor: mode === "dark" ? "rgba(255,255,255,0.22)" : "rgba(46,107,80,0.12)", borderColor: mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(46,107,80,0.22)" }]}>
                <Text style={[styles.avatarInitial, { color: mode === "dark" ? "#fff" : "#2E6B50" }]}>{safeInitial}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.progressSection}
        >
          <LevelProgressRing
            progress={levelProgress}
            level={level}
            points={points}
            nextLevelPoints={nextLevelPoints}
          />
        </Animated.View>
      </View>

      {/* ── STREAK CLASSICA — WOW REDESIGN ── */}
      <Animated.View entering={FadeInDown.delay(180).springify()} style={streakStyles.stampCardShadow}>
      <View style={streakStyles.stampCard}>
        <LinearGradient
          colors={["#E0F4FF", "#F0F9FF", "#E8F7FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        <View style={streakStyles.decorCircle1} />
        <View style={streakStyles.decorCircle2} />

        <View style={streakStyles.stampHeader}>
          <View style={streakStyles.stampTitleRow}>
            <View style={streakStyles.stampIconWrap}>
              <Image source={require("@/assets/images/streak-icon.png")} style={{ width: 18, height: 18 }} resizeMode="contain" />
            </View>
            <Text style={streakStyles.stampTitle}>CHECK IN</Text>
          </View>
          <View style={streakStyles.stampWeekPill}>
            <MaterialCommunityIcons name="calendar-week" size={12} color="#0369A1" />
            <Text style={streakStyles.stampWeekLabel}>{loginStreak}/7</Text>
          </View>
        </View>

        <View style={streakStyles.stampRow}>
          {Array.from({ length: 7 }, (_, i) => {
            const done = i < loginStreak;
            const isNext = i === loginStreak && loginStreak < 7;
            const isFinal = i === 6;
            const cellStyle = [
              streakStyles.stampCell,
              done ? streakStyles.stampCellDone : isNext ? streakStyles.stampCellNext : streakStyles.stampCellFuture,
              isFinal && !done && streakStyles.stampCellFinal,
              isNext ? cellBounceStyle : undefined,
            ];
            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(280 + i * 60).springify()}
                style={streakStyles.stampSlot}
              >
                <Animated.View style={[cellStyle, { width: cellSize, height: cellSize }]}>
                  {done && (
                    <View style={streakStyles.stampCellDoneInner}>
                      <MaterialCommunityIcons name="check-bold" size={18} color="#fff" />
                    </View>
                  )}
                  {isNext && (
                    <View style={streakStyles.stampCellGlow}>
                      <Image source={require("@/assets/images/drop-xp.png")} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </View>
                  )}
                  {!done && !isNext && isFinal && (
                    <MaterialCommunityIcons name="trophy" size={18} color="rgba(3,105,161,0.35)" />
                  )}
                  {!done && !isNext && !isFinal && (
                    <Text style={streakStyles.stampCellFutureNum}>{i + 1}</Text>
                  )}
                </Animated.View>
                <Text style={[
                  streakStyles.stampLabel,
                  done ? streakStyles.stampLabelDone : isNext ? streakStyles.stampLabelNext : streakStyles.stampLabelFuture,
                ]}>{done ? "fatto" : isFinal ? "bonus" : `G${i + 1}`}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={streakStyles.progressBarBg}>
          <LinearGradient
            colors={["#38BDF8", "#0EA5E9", "#0369A1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[streakStyles.progressBarFill, { width: `${Math.min((loginStreak / 7) * 100, 100)}%` }]}
          />
        </View>

        <View style={streakStyles.stampFooter}>
          <View style={streakStyles.stampFooterLeft}>
            <MaterialCommunityIcons name="fire" size={16} color="#F97316" />
            <Text style={streakStyles.stampFooterDay}>{loginStreak > 0 ? `${loginStreak} giorni di fila` : "Inizia oggi"}</Text>
          </View>
          <View style={streakStyles.stampFooterReward}>
            <View style={streakStyles.rewardPill}>
              <Text style={streakStyles.stampFooterRewardText}>+250</Text>
              <XpIcon size={14} />
            </View>
          </View>
        </View>

        {/* ── OVERLAY CHECK IN — visibile solo se non ancora fatto oggi ── */}
        {!checkedInToday && (
          <Pressable
            style={streakStyles.checkinOverlay}
            onPress={handleCheckin}
            disabled={checkingIn}
          >
            {checkinKey > 0 && (
              <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]} pointerEvents="none">
                <View style={{ width: 0, height: 0 }}>
                  <CheckinDropBurst key={checkinKey} dist={confettiDist} alpha={confettiAlpha} />
                </View>
              </View>
            )}
            <Animated.View style={combinedBtnStyle}>
              <LinearGradient
                colors={["#38BDF8", "#0284C7", "#0369A1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={streakStyles.checkinOverlayBtn}
              >
                <MaterialCommunityIcons name="water-plus" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={streakStyles.checkinBtnText}>Fai Check In</Text>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        )}
      </View>
      </Animated.View>

      {/* ── STREAK GOLD — sempre visibile, lucchettato se no LeafyGold ── */}
      <Animated.View entering={FadeInDown.delay(220).springify()} style={streakStyles.stampGoldCardShadow}>
        <View style={streakStyles.stampGoldCard}>
          <LinearGradient
            colors={["#FFF8E1", "#FFFBF0", "#FEF3C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
          <View style={streakStyles.decorCircleGold1} />
          <View style={streakStyles.decorCircleGold2} />

          <View style={streakStyles.stampHeader}>
            <View style={streakStyles.stampTitleRow}>
              <View style={streakStyles.stampGoldIconWrap}>
                <Image source={require("@/assets/images/leafy-gold-icon.png")} style={{ width: 18, height: 18 }} resizeMode="contain" />
              </View>
              <Text style={streakStyles.stampGoldTitle}>CHECK IN GOLD</Text>
            </View>
            <View style={streakStyles.stampWeekPillGold}>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#B8860B" />
              <Text style={[streakStyles.stampWeekLabel, { color: "#B8860B" }]}>{bpStreakClaimed}/7</Text>
            </View>
          </View>

          <View style={streakStyles.stampRow}>
            {BP_PRIZES_DISPLAY.map((prize, i) => {
              const done = i < bpStreakClaimed;
              const isNext = i === bpStreakClaimed && !bpStreakCompleted;
              const isFinal = i === 6;
              return (
                <Animated.View
                  key={i}
                  entering={FadeInDown.delay(320 + i * 60).springify()}
                  style={streakStyles.stampSlot}
                >
                  <View style={[
                    streakStyles.stampCell,
                    done ? streakStyles.stampGoldCellDone
                      : isNext ? streakStyles.stampGoldCellNext
                      : streakStyles.stampGoldCellFuture,
                    isFinal && !done && streakStyles.stampGoldCellFinal,
                    { width: cellSize, height: cellSize },
                  ]}>
                    {done && (
                      <View style={streakStyles.stampGoldCellDoneInner}>
                        {prize.type === "both" ? <Text style={{ fontSize: 14 }}>⭐</Text>
                          : prize.type === "lea" ? <LeaIcon size={16} />
                          : <MaterialCommunityIcons name="check-bold" size={16} color="#fff" />
                        }
                      </View>
                    )}
                    {isNext && (
                      <View style={streakStyles.stampCellGlow}>
                        <MaterialCommunityIcons name="star-four-points" size={18} color="#B8860B" />
                      </View>
                    )}
                    {!done && !isNext && isFinal && (
                      <MaterialCommunityIcons name="crown" size={18} color="rgba(184,134,11,0.35)" />
                    )}
                    {!done && !isNext && !isFinal && <Text style={streakStyles.stampGoldFutureNum}>{i + 1}</Text>}
                  </View>
                  <Text style={[
                    streakStyles.goldPrizeLabel,
                    { color: done ? "#B8860B" : isNext ? "rgba(184,134,11,0.85)" : "rgba(245,158,11,0.40)" },
                  ]}>{prize.label}</Text>
                </Animated.View>
              );
            })}
          </View>

          <View style={streakStyles.progressBarBgGold}>
            <LinearGradient
              colors={["#FBBF24", "#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[streakStyles.progressBarFillGold, { width: `${Math.min((bpStreakClaimed / 7) * 100, 100)}%` }]}
            />
          </View>

          <View style={streakStyles.stampFooter}>
            <View style={streakStyles.stampFooterLeft}>
              <MaterialCommunityIcons name="shield-star" size={16} color="#B8860B" />
              <Text style={[streakStyles.stampFooterDay, { color: "rgba(146,64,14,0.60)" }]}>
                {bpStreakCompleted ? "Completata" : `Premio ${bpStreakClaimed}/7`}
              </Text>
            </View>
            {!bpStreakCompleted && (
              <View style={streakStyles.stampFooterReward}>
                <View style={streakStyles.rewardPillGold}>
                  <Text style={streakStyles.stampGoldFooterRewardText}>
                    +{BP_PRIZES_DISPLAY[bpStreakClaimed]?.label ?? ""}
                  </Text>
                  {(BP_PRIZES_DISPLAY[bpStreakClaimed]?.type === "drops" || BP_PRIZES_DISPLAY[bpStreakClaimed]?.type === "both") && <XpIcon size={13} />}
                  {(BP_PRIZES_DISPLAY[bpStreakClaimed]?.type === "lea" || BP_PRIZES_DISPLAY[bpStreakClaimed]?.type === "both") && <LeaIcon size={13} />}
                </View>
              </View>
            )}
          </View>

          {/* ── OVERLAY LUCCHETTO per non-Gold ── */}
          {!hasLeafyGold && (
            <Pressable
              style={streakStyles.goldLockedOverlay}
              onPress={() => setShowLeafyGoldModal(true)}
            >
              <View style={streakStyles.goldLockedIconWrap}>
                <MaterialCommunityIcons name="lock" size={32} color="#B8860B" />
              </View>
              <View style={streakStyles.goldLockedBadgeRow}>
                <Image
                  source={require("@/assets/images/leafy-gold-icon.png")}
                  style={{ width: 18, height: 18 }}
                  resizeMode="contain"
                />
                <Text style={streakStyles.goldLockedTitle}>Leafy Gold</Text>
              </View>
              <Text style={streakStyles.goldLockedSub}>2× $LEA · Streak protetta · Badge esclusivi</Text>
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={streakStyles.goldLockedBtn}
              >
                <Text style={streakStyles.goldLockedBtnText}>Attiva ora · 0,89€/mese</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </Animated.View>

      <LeafyGoldModal
        visible={showLeafyGoldModal}
        onClose={() => {
          setShowLeafyGoldModal(false);
          refetchProfile();
        }}
      />


      {/* ── WALK-IN TOAST ── */}
      {walkinToast && (
        <Animated.View entering={FadeInDown.springify()} style={[inStoreStyles.walkinToast, { backgroundColor: "#1A3028" }]}>
          <MaterialCommunityIcons name="store-check" size={22} color="#51B888" />
          <View style={{ flex: 1 }}>
            <Text style={inStoreStyles.walkinToastTitle}>Walk-in completato!</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={inStoreStyles.walkinToastSub}>+{walkinToast.drops}</Text>
              <XpIcon size={13} />
              <Text style={inStoreStyles.walkinToastSub}> da {walkinToast.locationName}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── IN-STORE MODE ── */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 0 }}>
        <Pressable
          style={[inStoreStyles.toggleRow, { backgroundColor: theme.card }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setInStoreModeEnabled((prev) => !prev);
          }}
        >
          <MaterialCommunityIcons name="store-marker" size={20} color={inStoreModeEnabled ? theme.leaf : theme.textMuted} />
          <Text style={[inStoreStyles.toggleLabel, { color: inStoreModeEnabled ? theme.leaf : theme.text }]}>Rilevamento negozi</Text>
          <View style={[inStoreStyles.togglePill, { backgroundColor: inStoreModeEnabled ? theme.leaf : theme.border }]}>
            <View style={[inStoreStyles.toggleKnob, { transform: [{ translateX: inStoreModeEnabled ? 18 : 2 }] }]} />
          </View>
        </Pressable>

        {inStoreModeEnabled && inStoreModeActive && (
          <View style={[inStoreStyles.panel, { backgroundColor: theme.card }]}>
            {permissionStatus === "denied" && (
              <View style={inStoreStyles.permRow}>
                <Feather name="map-pin" size={16} color={theme.amber} />
                <Text style={[inStoreStyles.permText, { color: theme.textSecondary }]}>
                  Posizione non autorizzata. Abilita la posizione nelle impostazioni.
                </Text>
              </View>
            )}

            {permissionStatus === "granted" && locationsLoading && locations.length === 0 && (
              <View style={inStoreStyles.loadingRow}>
                <ActivityIndicator size="small" color={theme.leaf} />
                <Text style={[inStoreStyles.loadingText, { color: theme.textSecondary }]}>Ricerca negozi nelle vicinanze…</Text>
              </View>
            )}

            {permissionStatus === "granted" && !locationsLoading && locations.length === 0 && (
              <View style={inStoreStyles.emptyRow}>
                <MaterialCommunityIcons name="store-off" size={28} color={theme.textMuted} />
                <Text style={[inStoreStyles.emptyText, { color: theme.textSecondary }]}>Nessun negozio partner nelle vicinanze (300 m)</Text>
                <Pressable onPress={refreshLocations} style={[inStoreStyles.refreshBtn, { borderColor: theme.border }]}>
                  <Feather name="refresh-cw" size={13} color={theme.leaf} />
                  <Text style={[inStoreStyles.refreshBtnText, { color: theme.leaf }]}>Riprova</Text>
                </Pressable>
              </View>
            )}

            {permissionStatus === "granted" && locations.map((loc) => (
              <InStoreLocationCard
                key={loc.id}
                location={loc}
                walkin={walkin}
                theme={theme}
              />
            ))}
          </View>
        )}
      </Animated.View>


      {/* ── SFIDE ── */}
      {challenges && challenges.length > 0 && (() => {
        const daily = challenges.filter(c => c.challengeType === "daily");
        const weekly = challenges.filter(c => c.challengeType === "weekly");
        return (
          <Animated.View entering={FadeInDown.delay(350).springify()} style={{ marginTop: 24 }}>
            <View style={challengeStyles.sectionHeader}>
              <MaterialCommunityIcons name="flag-checkered" size={18} color={theme.leaf} />
              <Text style={[challengeStyles.sectionTitle, { color: theme.text }]}>Sfide</Text>
            </View>

            {daily.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[challengeStyles.subLabel, { color: theme.textSecondary }]}>Giornaliere</Text>
                {daily.map(ch => (
                  <ChallengeCard key={ch.id} challenge={ch} theme={theme} />
                ))}
              </View>
            )}

            {weekly.length > 0 && (
              <View>
                <Text style={[challengeStyles.subLabel, { color: theme.textSecondary }]}>Settimanali</Text>
                {weekly.map(ch => (
                  <ChallengeCard key={ch.id} challenge={ch} theme={theme} />
                ))}
              </View>
            )}
          </Animated.View>
        );
      })()}

    </ScrollView>
    </View>
  );
}

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
  theme: import("@/constants/theme").ThemeColors;
}) {
  const fraction = remaining / total;
  const dashOffset = DWELL_CIRCUMFERENCE * fraction;
  return (
    <View style={inStoreStyles.dwellRingContainer}>
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
      <View style={inStoreStyles.dwellRingCenter}>
        <Text style={[inStoreStyles.dwellRingSeconds, { color }]}>{remaining}</Text>
        <Text style={[inStoreStyles.dwellRingLabel, { color: theme.textMuted }]}>sec</Text>
      </View>
      <Pressable style={[inStoreStyles.cancelBtn, { borderColor: theme.border, marginTop: 8, alignSelf: "center" }]} onPress={onCancel}>
        <Text style={[inStoreStyles.cancelBtnText, { color: theme.textMuted }]}>Annulla</Text>
      </Pressable>
    </View>
  );
}

function InStoreLocationCard({
  location,
  walkin,
  theme,
}: {
  location: NearbyLocation;
  walkin: ReturnType<typeof useWalkin>;
  theme: import("@/constants/theme").ThemeColors;
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

  const progressFraction = isDwelling
    ? 1 - walkin.dwellRemaining / walkin.dwellTotal
    : isRewarded || isDone
    ? 1
    : 0;

  return (
    <View style={[inStoreStyles.locationCard, { borderColor: isOasi ? "#A78BFA" : theme.border, borderWidth: isOasi ? 1.5 : 1 }]}>
      <View style={inStoreStyles.locationHeader}>
        <View style={{ flex: 1 }}>
          <View style={inStoreStyles.locationNameRow}>
            {isOasi && (
              <View style={inStoreStyles.oasiBadge}>
                <Text style={inStoreStyles.oasiBadgeText}>OASI</Text>
              </View>
            )}
            <Text style={[inStoreStyles.locationName, { color: theme.text }]}>{location.name}</Text>
          </View>
          <Text style={[inStoreStyles.locationDist, { color: theme.textMuted }]}>
            {location.distanceM < 50
              ? "Sei qui!"
              : location.distanceM < 1000
              ? `${Math.round(location.distanceM)} m di distanza`
              : `${(location.distanceM / 1000).toFixed(1)} km di distanza`}
          </Text>
          <Text style={[inStoreStyles.locationCap, { color: theme.textMuted }]}>
            {`Max ${location.walkinMaxPerDay}x al giorno · ${location.walkinDrops} drops`}
          </Text>
        </View>
        <View style={[inStoreStyles.dropsBubble, { backgroundColor: isOasi ? "rgba(167,139,250,0.12)" : theme.primaryLight, flexDirection: "row", alignItems: "center", gap: 3 }]}>
          <Text style={[inStoreStyles.dropsBubbleText, { color: isOasi ? "#7C3AED" : theme.leaf }]}>
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
        <View style={[inStoreStyles.rewardRow, { backgroundColor: isRewarded ? "rgba(81,184,136,0.12)" : theme.primaryLight }]}>
          <MaterialCommunityIcons
            name={isRewarded ? "check-circle" : "clock-check-outline"}
            size={16}
            color={isRewarded ? "#51B888" : theme.textMuted}
          />
          {isRewarded ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={[inStoreStyles.rewardText, { color: "#51B888" }]}>
                {`+${walkin.result?.dropsAwarded}`}
              </Text>
              <XpIcon size={13} />
              <Text style={[inStoreStyles.rewardText, { color: "#51B888" }]}> guadagnati!</Text>
            </View>
          ) : (
            <Text style={[inStoreStyles.rewardText, { color: theme.textMuted }]}>Già completato oggi</Text>
          )}
        </View>
      )}

      {isActive && location.challenges.length > 0 && isDwelling && (
        <View style={inStoreStyles.challengesSection}>
          <Text style={[inStoreStyles.challengesTitle, { color: theme.textSecondary }]}>Sfide in negozio</Text>
          {location.challenges.map((ch) => (
            <Pressable
              key={ch.id}
              style={[inStoreStyles.challengeRow, { backgroundColor: theme.primaryLight }]}
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
                <Text style={[inStoreStyles.challengeName, { color: theme.text }]}>{ch.name}</Text>
                {ch.description && (
                  <Text style={[inStoreStyles.challengeDesc, { color: theme.textMuted }]}>{ch.description}</Text>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={[inStoreStyles.challengeDrops, { color: theme.leaf }]}>+{ch.dropsReward}</Text>
                <XpIcon size={14} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!isDwelling && !isActive && location.challenges.length > 0 && (
        <View style={inStoreStyles.challengesSection}>
          <Text style={[inStoreStyles.challengesTitle, { color: theme.textSecondary }]}>Sfide disponibili</Text>
          {location.challenges.map((ch) => (
            <View key={ch.id} style={[inStoreStyles.challengeRow, { backgroundColor: theme.primaryLight, opacity: 0.55 }]}>
              <MaterialCommunityIcons name="barcode-scan" size={16} color={theme.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[inStoreStyles.challengeName, { color: theme.textMuted }]}>{ch.name}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Text style={[inStoreStyles.challengeDrops, { color: theme.textMuted }]}>+{ch.dropsReward}</Text>
                <XpIcon size={14} />
              </View>
            </View>
          ))}
          <Text style={[inStoreStyles.challengeHint, { color: theme.textMuted }]}>Entra nel negozio per sbloccare le sfide</Text>
        </View>
      )}

      {isError && (
        <View style={inStoreStyles.submittingRow}>
          <Feather name="alert-circle" size={14} color={theme.amber} />
          <Text style={[inStoreStyles.submittingText, { color: theme.amber }]}>{walkin.errorMsg ?? "Errore"}</Text>
          <Pressable onPress={walkin.reset}>
            <Text style={{ color: theme.leaf, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>Riprova</Text>
          </Pressable>
        </View>
      )}


      {(isStarting || isSubmitting) && (
        <View style={inStoreStyles.submittingRow}>
          <ActivityIndicator size="small" color={theme.leaf} />
          <Text style={[inStoreStyles.submittingText, { color: theme.textSecondary }]}>
            {isStarting ? "Avvio sessione…" : "Registrazione walk-in…"}
          </Text>
        </View>
      )}
    </View>
  );
}

const inStoreStyles = StyleSheet.create({
  walkinToast: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walkinToastTitle: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
  },
  walkinToastSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "DMSans_600SemiBold",
  },
  togglePill: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  panel: {
    marginTop: 10,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  permText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  emptyRow: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  refreshBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
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
  dwellRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dwellBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  dwellFill: {
    height: 6,
    borderRadius: 3,
  },
  dwellTimer: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    minWidth: 32,
    textAlign: "right",
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
    height: DWELL_RING_SIZE,
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
  challengeHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 6,
    opacity: 0.7,
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
  enterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enterBtnText: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
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

const streakStyles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastTitle: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
  },
  toastSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    flex: 1,
  },
  cardBadge: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  stampCardShadow: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  stampCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.25)",
    overflow: "hidden" as const,
  },
  decorCircle1: {
    position: "absolute" as const,
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  decorCircle2: {
    position: "absolute" as const,
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(14,165,233,0.08)",
  },
  stampHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 14,
  },
  stampTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  stampIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#0369A1",
    letterSpacing: 1.5,
  },
  stampWeekPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(3,105,161,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stampWeekLabel: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "#0369A1",
  },
  stampRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  stampSlot: {
    alignItems: "center" as const,
    gap: 5,
    flex: 1,
  },
  stampCell: {
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampCellFutureNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "rgba(3,105,161,0.22)",
  },
  stampCellDone: {
    backgroundColor: "#0EA5E9",
  },
  stampCellDoneInner: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampCellNext: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 2,
    borderColor: "#38BDF8",
  },
  stampCellGlow: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampCellFuture: {
    backgroundColor: "rgba(224,242,254,0.60)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.20)",
    ...(Platform.OS === "ios" ? { borderStyle: "dashed" as const } : {}),
  },
  stampCellFinal: {
    borderWidth: 1.5,
    borderColor: "rgba(3,105,161,0.30)",
    ...(Platform.OS === "ios" ? { borderStyle: "dashed" as const } : {}),
    backgroundColor: "rgba(224,242,254,0.80)",
  },
  stampLabel: {
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
  },
  stampLabelDone: {
    color: "#0369A1",
  },
  stampLabelNext: {
    color: "rgba(3,105,161,0.65)",
  },
  stampLabelFuture: {
    color: "rgba(0,0,0,0.15)",
  },
  stampFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  stampFooterLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  stampFooterDay: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
  },
  stampFooterReward: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  rewardPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(3,105,161,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stampFooterRewardText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 14,
    color: "#0369A1",
  },
  checkinOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(224,244,255,0.90)",
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  checkinOverlayBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  checkinBtnText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(56,189,248,0.12)",
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 10,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  cardHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 15,
  },
  stampGoldCardShadow: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  },
  stampGoldCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFFBF0",
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.45)",
    overflow: "hidden" as const,
  },
  goldLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 248, 220, 0.93)",
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 6,
    padding: 16,
  },
  goldLockedIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(251,191,36,0.20)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 2,
  },
  goldLockedBadgeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  goldLockedTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#92400E",
    letterSpacing: 0.2,
  },
  goldLockedSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(146,64,14,0.75)",
    textAlign: "center" as const,
  },
  goldLockedBtn: {
    marginTop: 6,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  goldLockedBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#fff",
    letterSpacing: 0.3,
  },
  decorCircleGold1: {
    position: "absolute" as const,
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245,158,11,0.10)",
  },
  decorCircleGold2: {
    position: "absolute" as const,
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(251,191,36,0.08)",
  },
  stampGoldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(245,158,11,0.12)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampWeekPillGold: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(184,134,11,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stampGoldTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    color: "#B8860B",
    letterSpacing: 1.5,
  },
  stampGoldCellDone: {
    backgroundColor: "#F59E0B",
  },
  stampGoldCellDoneInner: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  stampGoldCellNext: {
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  stampGoldCellFuture: {
    backgroundColor: "rgba(254,243,199,0.60)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.20)",
    ...(Platform.OS === "ios" ? { borderStyle: "dashed" as const } : {}),
  },
  stampGoldCellFinal: {
    borderWidth: 1.5,
    borderColor: "rgba(184,134,11,0.30)",
    ...(Platform.OS === "ios" ? { borderStyle: "dashed" as const } : {}),
    backgroundColor: "rgba(254,243,199,0.80)",
  },
  stampGoldFooterRewardText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
    color: "#92400E",
  },
  rewardPillGold: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(184,134,11,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stampGoldFutureNum: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    color: "rgba(184,134,11,0.22)",
  },
  goldPrizeLabel: {
    fontFamily: "DMSans_700Bold",
    fontSize: 8,
    textAlign: "center" as const,
  },
  progressBarBgGold: {
    height: 6,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 10,
    overflow: "hidden" as const,
  },
  progressBarFillGold: {
    height: 6,
    borderRadius: 3,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    padding: 32,
  },

  heroSection: {
    overflow: "hidden",
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBoxHero: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTextHero: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  greetingHero: {
    fontSize: 16,
    fontFamily: "DMSans_600SemiBold",
    color: "rgba(255,255,255,0.85)",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropsBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  dropsBadgeValue: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    color: "#ffffff",
  },
  dropsBadgeSymbol: {
    fontSize: 10,
    fontFamily: "DMSans_700Bold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
  },
  leaBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  leaBadgeSymbol: {
    fontSize: 10,
    fontFamily: "DMSans_700Bold",
    color: "#AADF2A",
    letterSpacing: 0.5,
  },
  leaBadgeValue: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: "#ffffff",
  },
  avatarCircleHero: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  progressSection: {
    alignItems: "center",
    paddingVertical: 8,
  },

  impactSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  impactTitle: {
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
    color: Colors.text,
    marginBottom: 12,
  },
  impactRow: {
    flexDirection: "row",
    gap: 10,
  },
  impactCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  impactCardValue: {
    fontSize: 22,
    fontFamily: "DMSans_700Bold",
    color: Colors.text,
  },
  impactCardLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  bpCtaOuter: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 0,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 22,
  },
  bpCtaCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    backgroundColor: "#0A1F0D",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: "center",
  },
  bpCtaIconWrap: {
    marginBottom: 2,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 8,
  },
  bpCtaTitle: {
    fontSize: 12,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    marginBottom: 0,
    letterSpacing: 0.2,
  },
  bpCtaPrice: {
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
    color: "#FFD700",
    marginBottom: 1,
    letterSpacing: -0.3,
  },
  bpCtaPriceSub: {
    fontSize: 9,
    fontFamily: "DMSans_400Regular",
    color: "rgba(255,215,0,0.7)",
  },
  bpCtaSub: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 12,
  },
  bpCtaBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  bpCtaBtnText: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: "#1a1a00",
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 64,
    borderRadius: 24,
    shadowColor: Colors.leaf,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
  },
  challengeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "rgba(46,107,80,0.08)",
    borderWidth: 1,
    borderColor: "rgba(46,107,80,0.18)",
  },
  challengeButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.leaf,
  },
});

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#2E6B50",
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decoCircle2: {
    position: "absolute",
    bottom: -40,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  logoSection: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logo: {
    width: SCREEN_WIDTH * 0.7,
    height: 140,
    marginBottom: 4,
  },
  logoSmall: {
    width: SCREEN_WIDTH * 0.45,
    height: 80,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 48,
  },
  actions: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 20,
    alignItems: "center",
    gap: 10,
  },
  primaryBtn: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  btnActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  btnActiveText: {
    color: "#FFFFFF",
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
    color: "#2E6B50",
    letterSpacing: 0.3,
  },
  outlineBtn: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  outlineBtnActive: {
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  outlineBtnText: {
    fontSize: 16,
    fontFamily: "DMSans_600SemiBold",
    color: "#FFFFFF",
  },
  accordionBody: {
    width: "100%",
    maxWidth: 280,
    gap: 10,
    paddingTop: 4,
    paddingBottom: 6,
    overflow: "hidden" as const,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    maxWidth: 280,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  googleBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#3C4043",
  },
  fbBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    maxWidth: 280,
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#1877F2",
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  fbBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  footer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
    textAlign: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 8,
  },
  inputIcon: {
    width: 18,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(220,38,38,0.2)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FCA5A5",
    flex: 1,
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
    color: "#2E6B50",
    letterSpacing: 0.2,
  },
});
