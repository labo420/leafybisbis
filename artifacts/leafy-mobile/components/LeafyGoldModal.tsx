import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "@/context/auth";

interface LeafyGoldModalProps {
  visible: boolean;
  onClose: () => void;
}

const features = [
  {
    emoji: "⚡",
    title: "Doppio cashback LEA",
    description: "Guadagni il doppio su ogni scontrino sostenibile",
    bg: "#FFFBEB",
    border: "rgba(217,119,6,0.18)",
    accent: "#B45309",
  },
  {
    emoji: "💸",
    title: "Preleva su PayPal",
    description: "Converti i tuoi LEA in euro reali, quando vuoi",
    bg: "#EFF6FF",
    border: "rgba(3,105,161,0.18)",
    accent: "#0369A1",
  },
  {
    emoji: "📈",
    title: "Moltiplicatore mensile",
    description: "I tuoi guadagni crescono più a lungo sei abbonato",
    bg: "#F0FDF4",
    border: "rgba(21,128,61,0.18)",
    accent: "#15803D",
  },
];

export default function LeafyGoldModal({ visible, onClose }: LeafyGoldModalProps) {
  const { activateLeafyGold, hasLeafyGold } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

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
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.screen}>
          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <View style={styles.closeCircle}>
              <Feather name="x" size={18} color="#6B7280" />
            </View>
          </Pressable>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.hero}>
            <View style={styles.glowWrap}>
              <Image
                source={require("@/assets/images/leafy-gold-icon.png")}
                style={styles.heroIcon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>✦  LEAFY GOLD</Text>
            </View>

            <Text style={styles.title}>Passa a Premium</Text>
            <Text style={styles.subtitle}>Sblocca il massimo potenziale di Leafy</Text>
          </Animated.View>

          {/* Feature cards */}
          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.featureList}>
            {features.map((f, i) => (
              <View
                key={i}
                style={[styles.featureCard, { backgroundColor: f.bg, borderColor: f.border }]}
              >
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                </View>
                <View style={styles.featureTexts}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Price */}
          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Solo</Text>
              <Text style={styles.priceAmount}>0,89</Text>
              <Text style={styles.priceCurrency}>€</Text>
              <Text style={styles.pricePer}>/mese</Text>
            </View>

            <View style={styles.bullets}>
              {["Nessun vincolo", "Annulla quando vuoi"].map((t) => (
                <View key={t} style={styles.bullet}>
                  <Feather name="check" size={11} color="#2E6B50" strokeWidth={3} />
                  <Text style={styles.bulletText}>{t}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.ctaSection}>
            {hasLeafyGold || activated ? (
              <View style={styles.activatedRow}>
                <Feather name="check-circle" size={22} color="#2E6B50" />
                <Text style={styles.activatedText}>Leafy Gold attivo!</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88 }]}
                onPress={handleActivate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>Attiva Leafy Gold</Text>
                )}
              </Pressable>
            )}

            <Pressable onPress={onClose} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Non ora</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Hero */
  hero: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 24,
  },
  glowWrap: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 8,
  },
  heroIcon: {
    width: 110,
    height: 110,
  },
  badge: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: "rgba(217,119,6,0.10)",
    borderWidth: 1,
    borderColor: "rgba(217,119,6,0.28)",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#B45309",
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 19,
  },

  /* Features */
  featureList: {
    gap: 10,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 22,
  },
  featureTexts: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    letterSpacing: -0.2,
  },
  featureDesc: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 17,
  },

  /* Price */
  priceSection: {
    alignItems: "center",
    marginTop: 22,
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  priceAmount: {
    fontSize: 46,
    fontFamily: "Nunito_700Bold",
    color: "#111827",
    letterSpacing: -2,
    lineHeight: 50,
  },
  priceCurrency: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "#374151",
    lineHeight: 50,
  },
  pricePer: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    alignSelf: "flex-end",
    paddingBottom: 6,
  },
  bullets: {
    flexDirection: "row",
    gap: 20,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  bulletText: {
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  /* CTA */
  ctaSection: {
    marginTop: 20,
    gap: 14,
    alignItems: "center",
  },
  ctaBtn: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2E6B50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E6B50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.2,
  },
  dismissBtn: {
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  activatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 18,
  },
  activatedText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#2E6B50",
  },
});
