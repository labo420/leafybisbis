import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";

interface LeafyGoldModalProps {
  visible: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: "zap" as const,
    title: "Doppio cashback LEA",
    desc: "Guadagni il doppio su ogni scontrino",
  },
  {
    icon: "dollar-sign" as const,
    title: "Preleva su PayPal",
    desc: "Converti i tuoi LEA in denaro reale",
  },
  {
    icon: "trending-up" as const,
    title: "Moltiplicatore mensile",
    desc: "I tuoi guadagni crescono ogni mese",
  },
];

export default function LeafyGoldModal({ visible, onClose }: LeafyGoldModalProps) {
  const { activateLeafyGold, hasLeafyGold } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  const translateY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    } else {
      translateY.value = 500;
    }
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleActivate = async () => {
    setLoading(true);
    await activateLeafyGold();
    setLoading(false);
    setActivated(true);
    setTimeout(() => {
      setActivated(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Animated.View
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }, sheetStyle]}
          >
            <Pressable onPress={() => {}}>
              <LinearGradient
                colors={["#0E2419", "#173325", "#1E3D2E"]}
                style={StyleSheet.absoluteFill}
              />

              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Close X */}
              <Pressable style={styles.closeX} onPress={onClose} hitSlop={12}>
                <Feather name="x" size={22} color="rgba(255,255,255,0.45)" />
              </Pressable>

              {/* Hero */}
              <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.hero}>
                <View style={styles.iconGlow}>
                  <Image
                    source={require("@/assets/images/leafy-gold-icon.png")}
                    style={styles.heroIcon}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>LEAFY GOLD</Text>
                </View>

                <Text style={styles.title}>Passa a Premium</Text>
                <Text style={styles.subtitle}>Sblocca il massimo potenziale di Leafy</Text>
              </Animated.View>

              {/* Features */}
              <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.featureList}>
                {features.map((f, i) => (
                  <View key={i}>
                    <View style={styles.featureRow}>
                      <View style={styles.featureIconWrap}>
                        <Feather name={f.icon} size={20} color="#FFD700" />
                      </View>
                      <View style={styles.featureTexts}>
                        <Text style={styles.featureTitle}>{f.title}</Text>
                        <Text style={styles.featureDesc}>{f.desc}</Text>
                      </View>
                    </View>
                    {i < features.length - 1 && <View style={styles.featureDivider} />}
                  </View>
                ))}
              </Animated.View>

              {/* Price box */}
              <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.priceBox}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Solo</Text>
                  <Text style={styles.price}>0,89€</Text>
                  <Text style={styles.priceLabel}>/mese</Text>
                </View>
                <Text style={styles.priceSub}>Annullabile in qualsiasi momento</Text>
              </Animated.View>

              {/* CTA */}
              <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.ctaWrap}>
                {hasLeafyGold || activated ? (
                  <Animated.View entering={FadeIn} style={styles.activatedRow}>
                    <Feather name="check-circle" size={20} color="#4ade80" />
                    <Text style={styles.activatedText}>Leafy Gold attivo!</Text>
                  </Animated.View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
                    onPress={handleActivate}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={["#FFD700", "#FFC200", "#FFA500"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#1a4a2e" />
                      ) : (
                        <Text style={styles.ctaText}>✦  Attiva Leafy Gold</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                )}
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 20,
  },
  closeX: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconGlow: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  heroIcon: {
    width: 100,
    height: 100,
  },
  badgePill: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#FFD700",
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 26,
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 19,
  },
  featureList: {
    marginBottom: 20,
    gap: 0,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  featureDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTexts: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.95)",
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  priceBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    backgroundColor: "rgba(255,215,0,0.06)",
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  price: {
    fontSize: 32,
    fontFamily: "DMSans_700Bold",
    color: "#FFD700",
  },
  priceSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },
  ctaWrap: {
    gap: 0,
  },
  ctaBtn: {
    borderRadius: 100,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#1a4a2e",
    letterSpacing: 0.3,
  },
  activatedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  activatedText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#4ade80",
  },
});
