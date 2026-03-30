import React, { useState } from "react";
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/context/theme";

const { width: SW } = Dimensions.get("window");

const STEPS = [
  {
    image: require("../assets/tutorial/slide1-leaf.png") as number,
    tag: "01 / 04",
    title: "Benvenuto in Leafy!",
    body: "La prima app italiana che trasforma ogni tua spesa in drops e cashback reale in €.",
  },
  {
    image: require("../assets/tutorial/slide2-scan.png") as number,
    tag: "02 / 04",
    title: "Scansiona & Guadagna",
    body: "Carica i tuoi scontrini al supermercato: ogni prodotto con buon Eco-Score ti porta drops e $LEA.",
  },
  {
    image: require("../assets/badges/level-giungla.png") as number,
    tag: "03 / 04",
    title: "Sali di Livello",
    body: "Da Germoglio a Giungla: ogni acquisto eco ti avvicina al prossimo livello, con premi esclusivi da sbloccare.",
  },
  {
    image: require("../assets/tutorial/slide4-wallet.png") as number,
    tag: "04 / 04",
    title: "Ritira il tuo $LEA",
    body: "$LEA è il tuo cashback reale. Accumulalo con acquisti green e prelevalo direttamente su PayPal.",
  },
];

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

  const bgColor = mode === "dark" ? theme.card : "#FAFEFB";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
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

        {/* Slide area */}
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

              {/* Text */}
              <Text style={[styles.title, { color: theme.text }]}>{current.title}</Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>{current.body}</Text>
            </Animated.View>
          )}
        </View>

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
    fontFamily: "DMSans_700Bold",
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
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
