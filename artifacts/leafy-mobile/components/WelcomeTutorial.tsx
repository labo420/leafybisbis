import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { XpIcon } from "./XpIcon";
import { LeaIcon } from "./LeaIcon";
import { useTheme } from "@/context/theme";

const { width: SW } = Dimensions.get("window");

const BODY_BASE = {
  fontSize: 16 as const,
  fontFamily: "Inter_400Regular",
  lineHeight: 25 as const,
  textAlign: "center" as const,
};

const TITLE_BASE = {
  fontSize: 28 as const,
  fontFamily: "Nunito_700Bold",
  lineHeight: 36 as const,
  textAlign: "center" as const,
};

type StepDef = {
  image: number;
  tag: string;
  title: string | ((color: string) => React.ReactElement);
  body: string | ((color: string) => React.ReactElement);
};

const STEPS: StepDef[] = [
  {
    image: require("../assets/images/lea-icon.png") as number,
    tag: "01 / 05",
    title: "Benvenuto in Leafy!",
    body: (color: string) => (
      <View style={inlineRow}>
        <Text style={{ ...BODY_BASE, color }}>L'app che trasforma ogni tua spesa in </Text>
        <XpIcon size={16} />
        <Text style={{ ...BODY_BASE, color }}> e cashback reale.</Text>
      </View>
    ),
  },
  {
    image: require("../assets/tutorial/slide2-scan.png") as number,
    tag: "02 / 05",
    title: "Scansiona & Guadagna",
    body: (color: string) => (
      <View style={inlineRow}>
        <Text style={{ ...BODY_BASE, color }}>
          Carica i tuoi scontrini: ogni prodotto con un buon Eco-Score ti porta{" "}
        </Text>
        <XpIcon size={16} />
        <Text style={{ ...BODY_BASE, color }}> e </Text>
        <LeaIcon size={16} />
      </View>
    ),
  },
  {
    image: require("../assets/badges/level-giungla.png") as number,
    tag: "03 / 05",
    title: "Sali di Livello",
    body: "Da Germoglio a Giungla: ogni acquisto ti avvicina al prossimo livello, con premi esclusivi da sbloccare.",
  },
  {
    image: require("../assets/tutorial/slide-sfide.png") as number,
    tag: "04 / 05",
    title: "Sfide Giornaliere",
    body: (color: string) => (
      <View style={inlineRow}>
        <Text style={{ ...BODY_BASE, color }}>
          Ogni giorno nuove sfide da completare: guadagna{" "}
        </Text>
        <XpIcon size={16} />
        <Text style={{ ...BODY_BASE, color }}> extra e sali più velocemente di livello.</Text>
      </View>
    ),
  },
  {
    image: require("../assets/tutorial/slide4-wallet.png") as number,
    tag: "05 / 05",
    title: (color: string) => (
      <View style={inlineTitleRow}>
        <Text style={{ ...TITLE_BASE, color }}>Ritira i tuoi </Text>
        <LeaIcon size={26} />
      </View>
    ),
    body: (color: string) => (
      <View style={{ alignItems: "center", gap: 6 }}>
        <View style={inlineRow}>
          <LeaIcon size={16} />
          <Text style={{ ...BODY_BASE, color }}> è il tuo cashback reale.</Text>
        </View>
        <Text style={{ ...BODY_BASE, color }}>
          Accumulalo con acquisti e prelevalo direttamente su PayPal.
        </Text>
      </View>
    ),
  },
];

const inlineRow: import("react-native").ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
};

const inlineTitleRow: import("react-native").ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
};

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function WelcomeTutorial({ visible, onDismiss }: Props) {
  const { theme, mode } = useTheme();
  const [step, setStep] = useState(0);
  const [rendering, setRendering] = useState(true);
  const slideOffset = useSharedValue(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const goTo = (next: number) => {
    if (next === step) return;
    slideOffset.value = next > step ? SW : -SW;
    setRendering(false);
    setTimeout(() => {
      setStep(next);
      slideOffset.value = next > step ? SW : -SW;
      setRendering(true);
      slideOffset.value = withSpring(0, { damping: 22, stiffness: 200 });
    }, 50);
  };

  const next = () => {
    if (isLast) {
      onDismiss();
      setTimeout(() => setStep(0), 400);
    } else {
      goTo(step + 1);
    }
  };

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideOffset.value }],
  }));

  // Ref pattern: always-current state for use in stable gesture callbacks
  const stateRef = useRef({ step, goTo });
  stateRef.current = { step, goTo };

  const handleSwipeLeft = useCallback(() => {
    const { step: s, goTo: g } = stateRef.current;
    if (s < STEPS.length - 1) g(s + 1);
  }, []);

  const handleSwipeRight = useCallback(() => {
    const { step: s, goTo: g } = stateRef.current;
    if (s > 0) g(s - 1);
  }, []);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onEnd((e) => {
      "worklet";
      if (e.translationX < -60) runOnJS(handleSwipeLeft)();
      else if (e.translationX > 60) runOnJS(handleSwipeRight)();
    });

  const bgColor = mode === "dark" ? theme.card : "#FAFEFB";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.overlay, { backgroundColor: bgColor }]}>
          {/* Skip */}
          {!isLast && (
            <Pressable
              style={[styles.skipBtn, { top: Platform.OS === "ios" ? 54 : 36 }]}
              onPress={onDismiss}
              hitSlop={12}
            >
              <Text style={[styles.skipText, { color: theme.textMuted }]}>Salta</Text>
            </Pressable>
          )}

          {/* Slide area — swipeable */}
          <GestureDetector gesture={swipeGesture}>
            <View style={styles.slideArea}>
              {rendering && (
                <Animated.View
                  key={step}
                  entering={FadeInDown.duration(280).springify()}
                  exiting={FadeOut.duration(150)}
                  style={[styles.slide, slideStyle]}
                >
                  {/* Illustration */}
                  <Image
                    source={current.image}
                    style={styles.illustrationImg}
                    resizeMode="contain"
                  />

                  {/* Tag */}
                  <Text style={[styles.tag, { color: theme.textMuted }]}>{current.tag}</Text>

                  {/* Title */}
                  {typeof current.title === "string" ? (
                    <Text style={[styles.title, { color: theme.text }]}>{current.title}</Text>
                  ) : (
                    current.title(theme.text)
                  )}

                  {/* Body */}
                  {typeof current.body === "string" ? (
                    <Text style={[styles.body, { color: theme.textSecondary }]}>{current.body}</Text>
                  ) : (
                    current.body(theme.textSecondary)
                  )}
                </Animated.View>
              )}
            </View>
          </GestureDetector>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === step ? theme.leaf : theme.border,
                      width: i === step ? 28 : 8,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: theme.leaf, opacity: pressed ? 0.88 : 1 },
            ]}
            onPress={next}
          >
            <Text style={styles.ctaText}>
              {isLast ? "Inizia a guadagnare! 🌱" : "Avanti"}
            </Text>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingBottom: 48,
  },
  skipBtn: {
    position: "absolute",
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  slideArea: {
    flex: 1,
    overflow: "hidden",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
    paddingTop: 16,
  },
  illustrationImg: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  tag: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    lineHeight: 36,
  },
  body: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 25,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    marginHorizontal: 28,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#2E6B50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
