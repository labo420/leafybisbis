import React, { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import type { RingLayout } from "@/context/level-up";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const LEVEL_BADGE_IMAGES: Record<string, ImageSourcePropType> = {
  Germoglio: require("@/assets/badges/level-germoglio.png"),
  Ramoscello: require("@/assets/badges/level-ramoscello.png"),
  Arbusto: require("@/assets/badges/level-arbusto.png"),
  Albero: require("@/assets/badges/level-albero.png"),
  Foresta: require("@/assets/badges/level-foresta.png"),
  Giungla: require("@/assets/badges/level-giungla.png"),
};

const LEVEL_EMOJI: Record<string, string> = {
  Germoglio: "🌱",
  Ramoscello: "🌿",
  Arbusto: "🍃",
  Albero: "🌳",
  Foresta: "🌲",
  Giungla: "🌴",
};

interface LevelUpModalProps {
  visible: boolean;
  fromLevel: string;
  toLevel: string;
  ringTargetLayout: RingLayout | null;
  onClose: () => void;
}

const OLD_BADGE_EXPLODE_MS = 400;
const FLASH_DELAY_MS = OLD_BADGE_EXPLODE_MS;
const SHOCKWAVE_DELAY_MS = OLD_BADGE_EXPLODE_MS;
const PARTICLE_DELAY_MS = FLASH_DELAY_MS + 100;
const NEW_BADGE_DELAY_MS = 600;
const TEXT_DELAY_MS = 1100;
const SUCK_DELAY_MS = 2300;
const SUCK_DURATION_MS = 700;
const AUTO_CLOSE_MS = SUCK_DELAY_MS + SUCK_DURATION_MS + 100;

const PARTICLE_COUNT = 20;
const BADGE_DISPLAY_SIZE = 150;
const RING_BADGE_SIZE = 90;

function RadialParticle({
  index,
  total,
  delay,
}: {
  index: number;
  total: number;
  delay: number;
}) {
  const angle = (index / total) * 2 * Math.PI;
  const dist = 100 + (index % 3) * 40;
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;

  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 60 }),
        withDelay(250, withTiming(0, { duration: 350 })),
      ),
    );
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx * progress.value },
      { translateY: ty * progress.value },
      { scale: 1 - progress.value * 0.5 },
    ],
    opacity: opacity.value,
  }));

  const size = 6 + (index % 4) * 4;
  const colors = [
    "#4CAF50",
    "#81C784",
    "#FFD700",
    "#A5D6A7",
    "#66BB6A",
    "#C8E6C9",
    "#FFF176",
    "#FF8A65",
  ];

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors[index % colors.length],
        },
        style,
      ]}
    />
  );
}

export default function LevelUpModal({
  visible,
  fromLevel,
  toLevel,
  ringTargetLayout,
  onClose,
}: LevelUpModalProps) {

  const backdropOpacity = useSharedValue(0);

  const oldScale = useSharedValue(1);
  const oldOpacity = useSharedValue(1);

  const flashOpacity = useSharedValue(0);
  const flashScale = useSharedValue(0.01);

  const shockwaveScale = useSharedValue(0.01);
  const shockwaveOpacity = useSharedValue(0);

  const newScale = useSharedValue(4);
  const newOpacity = useSharedValue(0);
  const newTranslateX = useSharedValue(0);
  const newTranslateY = useSharedValue(0);

  const textOpacity = useSharedValue(0);

  const confettiRef = useRef<ConfettiCannon | null>(null);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearTimers = () => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    if (confettiTimer.current) {
      clearTimeout(confettiTimer.current);
      confettiTimer.current = null;
    }
  };

  useEffect(() => {
    if (!visible) {
      clearTimers();
      return;
    }

    backdropOpacity.value = 0;
    oldScale.value = 1;
    oldOpacity.value = 1;
    flashOpacity.value = 0;
    flashScale.value = 0.01;
    shockwaveScale.value = 0.01;
    shockwaveOpacity.value = 0;
    newScale.value = 4;
    newOpacity.value = 0;
    newTranslateX.value = 0;
    newTranslateY.value = 0;
    textOpacity.value = 0;

    backdropOpacity.value = withTiming(1, { duration: 250 });

    oldScale.value = withSequence(
      withTiming(1.05, { duration: 60, easing: Easing.out(Easing.quad) }),
      withTiming(2.8, { duration: OLD_BADGE_EXPLODE_MS - 60, easing: Easing.in(Easing.cubic) }),
    );
    oldOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: OLD_BADGE_EXPLODE_MS - 80 }),
    );

    flashScale.value = withDelay(
      FLASH_DELAY_MS,
      withTiming(20, { duration: 350, easing: Easing.out(Easing.quad) }),
    );
    flashOpacity.value = withDelay(
      FLASH_DELAY_MS,
      withSequence(
        withTiming(1, { duration: 40 }),
        withTiming(0, { duration: 310 }),
      ),
    );

    shockwaveScale.value = withDelay(
      SHOCKWAVE_DELAY_MS,
      withTiming(15, { duration: 700, easing: Easing.out(Easing.quad) }),
    );
    shockwaveOpacity.value = withDelay(
      SHOCKWAVE_DELAY_MS,
      withSequence(
        withTiming(0.6, { duration: 60 }),
        withTiming(0, { duration: 640 }),
      ),
    );

    newOpacity.value = withDelay(
      NEW_BADGE_DELAY_MS,
      withTiming(1, { duration: 80 }),
    );
    newScale.value = withDelay(
      NEW_BADGE_DELAY_MS,
      withSpring(1, { damping: 4, stiffness: 120, mass: 0.9 }),
    );

    textOpacity.value = withDelay(
      TEXT_DELAY_MS,
      withTiming(1, { duration: 350 }),
    );

    confettiTimer.current = setTimeout(() => {
      if (mountedRef.current) confettiRef.current?.start();
    }, NEW_BADGE_DELAY_MS + 200);

    autoCloseTimer.current = setTimeout(() => {
      if (!mountedRef.current) return;

      if (ringTargetLayout) {
        const ringCenterX = ringTargetLayout.x + ringTargetLayout.width / 2;
        const ringCenterY = ringTargetLayout.y + ringTargetLayout.height / 2;
        const deltaX = ringCenterX - SCREEN_W / 2;
        const deltaY = ringCenterY - SCREEN_H / 2;
        const targetScale = RING_BADGE_SIZE / BADGE_DISPLAY_SIZE;

        newTranslateX.value = withTiming(deltaX, {
          duration: SUCK_DURATION_MS,
          easing: Easing.inOut(Easing.cubic),
        });
        newTranslateY.value = withTiming(deltaY, {
          duration: SUCK_DURATION_MS,
          easing: Easing.inOut(Easing.cubic),
        });
        newScale.value = withTiming(targetScale, {
          duration: SUCK_DURATION_MS,
          easing: Easing.inOut(Easing.cubic),
        });
        newOpacity.value = withDelay(
          SUCK_DURATION_MS - 150,
          withTiming(0, { duration: 150 }),
        );
        textOpacity.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withDelay(
          SUCK_DURATION_MS - 200,
          withTiming(0, { duration: 250 }),
        );

        const closeTimer = setTimeout(() => {
          if (mountedRef.current) onClose();
        }, SUCK_DURATION_MS + 50);

        autoCloseTimer.current = closeTimer;
      } else {
        backdropOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
          if (mountedRef.current) onClose();
        }, 350);
      }
    }, SUCK_DELAY_MS);

    return clearTimers;
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const oldBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: oldScale.value }],
    opacity: oldOpacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flashScale.value }],
    opacity: flashOpacity.value,
  }));

  const shockwaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shockwaveScale.value }],
    opacity: shockwaveOpacity.value,
  }));

  const newBadgeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: newTranslateX.value },
      { translateY: newTranslateY.value },
      { scale: newScale.value },
    ],
    opacity: newOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, (_, i) => i),
    [],
  );

  if (!visible) return null;

  const fromImage = LEVEL_BADGE_IMAGES[fromLevel] ?? LEVEL_BADGE_IMAGES.Germoglio;
  const toImage = LEVEL_BADGE_IMAGES[toLevel] ?? LEVEL_BADGE_IMAGES.Germoglio;
  const toEmoji = LEVEL_EMOJI[toLevel] ?? "🌱";

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={s.overlay} pointerEvents="none">
        <Animated.View style={[s.backdrop, backdropStyle]} />

        <Animated.View style={[s.flash, flashStyle]} />

        <Animated.View style={[s.shockwave, shockwaveStyle]} />

        <View style={s.center}>
          <Animated.View style={[s.oldBadgeWrap, oldBadgeStyle]}>
            <Image source={fromImage} style={s.oldBadgeImage} resizeMode="contain" />
          </Animated.View>

          {particles.map((i) => (
            <RadialParticle
              key={i}
              index={i}
              total={PARTICLE_COUNT}
              delay={PARTICLE_DELAY_MS}
            />
          ))}

          <Animated.View style={[s.newBadgeWrap, newBadgeStyle]}>
            <Image source={toImage} style={s.newBadgeImage} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.View style={[s.textBox, textStyle]}>
          <Text style={s.title}>Nuovo livello!</Text>
          <Text style={s.subtitle}>
            Sei diventato un {toLevel}! {toEmoji}
          </Text>
        </Animated.View>

        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: SCREEN_W / 2, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={3000}
          explosionSpeed={450}
          colors={["#2E6B50", "#4CAF50", "#81C784", "#FFD700", "#A5D6A7", "#C8E6C9"]}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.82)",
  },
  flash: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
  },
  shockwave: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(165,214,167,0.8)",
    backgroundColor: "transparent",
  },
  center: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  oldBadgeWrap: {
    position: "absolute",
    width: BADGE_DISPLAY_SIZE,
    height: BADGE_DISPLAY_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  oldBadgeImage: {
    width: BADGE_DISPLAY_SIZE,
    height: BADGE_DISPLAY_SIZE,
  },
  newBadgeWrap: {
    position: "absolute",
    width: BADGE_DISPLAY_SIZE,
    height: BADGE_DISPLAY_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  newBadgeImage: {
    width: BADGE_DISPLAY_SIZE,
    height: BADGE_DISPLAY_SIZE,
  },
  textBox: {
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  title: {
    fontSize: 30,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
});
