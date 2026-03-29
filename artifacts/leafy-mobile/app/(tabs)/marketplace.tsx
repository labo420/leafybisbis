import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PayPalLogo from "@/components/PayPalLogo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import LeafyGoldModal from "@/components/LeafyGoldModal";
import { apiFetch } from "@/lib/api";
import { Fonts } from "@/constants/typography";

const PAYPAL_BLUE  = "#0070E0";
const LEAF_GREEN   = "#4DB847";
const EMERALD      = "#00C98A";
const EMERALD_GLOW = "#00E5A0";

const RING_SIZE      = 240;
const STROKE_WIDTH   = 16;
const RADIUS         = (RING_SIZE - STROKE_WIDTH) / 2;
const CX             = RING_SIZE / 2;
const CY             = RING_SIZE / 2;
const CIRCUMFERENCE  = 2 * Math.PI * RADIUS;
const ARC_START_DEG  = -120;
const ARC_TOTAL_DEG  = 240;
const MAX_LEA        = 3000;
const TRACK_DASH     = (ARC_TOTAL_DEG / 360) * CIRCUMFERENCE;
const SVG_ROTATION   = 150;
const CONTAINER_SIZE = 340;
const LABEL_RADIUS   = 150;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AMOUNTS = [
  { euros: 5,  lea: 500,  goldOnly: true  },
  { euros: 10, lea: 1000, goldOnly: false },
  { euros: 15, lea: 1500, goldOnly: false },
  { euros: 20, lea: 2000, goldOnly: false },
  { euros: 25, lea: 2500, goldOnly: false },
  { euros: 30, lea: 3000, goldOnly: false },
];

type Withdrawal = {
  id: number;
  leaAmount: string;
  euroAmount: string;
  status: "pending" | "completed" | "rejected";
  requestedAt: string;
  processedAt: string | null;
};

function statusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case "completed": return { label: "Completato",    color: "#4ade80" };
    case "rejected":  return { label: "Rifiutato",     color: "#f87171" };
    default:          return { label: "In elaborazione", color: "#FACC15" };
  }
}

function formatLea(n: number): string {
  return Math.floor(n).toLocaleString("it-IT", { maximumFractionDigits: 0 });
}

function AmountLabel({
  amount,
  isReached,
  isSel,
  px,
  py,
}: {
  amount: typeof AMOUNTS[0];
  isReached: boolean;
  isSel: boolean;
  px: number;
  py: number;
}) {
  const scale = useSharedValue(isSel ? 1.15 : isReached ? 1.08 : 1.0);

  useEffect(() => {
    scale.value = withSpring(isSel ? 1.15 : isReached ? 1.08 : 1.0, {
      damping: 12,
      stiffness: 200,
    });
  }, [isReached, isSel]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: px - 24,
          top: py - 20,
          width: 48,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        },
        animStyle,
      ]}
    >
      <Text
        style={{
          fontSize: isSel ? 15 : isReached ? 13 : 12,
          fontFamily: isSel || isReached ? Fonts.bodyBold : Fonts.bodyMedium,
          color: isSel ? LEAF_GREEN : isReached ? EMERALD : "rgba(20,60,35,0.42)",
          textShadowColor: isSel ? EMERALD_GLOW : "transparent",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: isSel ? 8 : 0,
        }}
      >
        €{amount.euros}
      </Text>
      <Text
        style={{
          fontSize: 8,
          fontFamily: Fonts.bodyRegular,
          color: isReached ? "rgba(0,201,138,0.70)" : "rgba(20,60,35,0.30)",
          marginTop: 1,
        }}
      >
        {formatLea(amount.lea)} LEA
      </Text>
    </Animated.View>
  );
}

function LeafyRing({
  leaBalance,
  selected,
}: {
  leaBalance: number;
  selected: typeof AMOUNTS[0] | null;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.000, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const targetProgress = React.useMemo(() => {
    if (selected) return Math.min(leaBalance, selected.lea) / MAX_LEA;
    return leaBalance / MAX_LEA;
  }, [leaBalance, selected]);

  const progressAnim = useSharedValue(Math.min(1, Math.max(0, targetProgress)));

  useEffect(() => {
    progressAnim.value = withTiming(Math.min(1, Math.max(0, targetProgress)), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetProgress]);

  const progressArcProps = useAnimatedProps(() => {
    const dashLen = Math.min(1, Math.max(0, progressAnim.value)) * TRACK_DASH;
    return { strokeDashoffset: CIRCUMFERENCE - dashLen };
  });

  const balanceFraction = Math.min(1, Math.max(0, leaBalance / MAX_LEA));
  const balanceAngleTarget = ARC_START_DEG + balanceFraction * ARC_TOTAL_DEG;
  const balanceAngleAnim = useSharedValue(balanceAngleTarget);

  useEffect(() => {
    balanceAngleAnim.value = withSpring(balanceAngleTarget, {
      damping: 15,
      stiffness: 100,
    });
  }, [balanceAngleTarget]);

  const dotStyle = useAnimatedStyle(() => {
    const rad = (balanceAngleAnim.value * Math.PI) / 180;
    const x = CONTAINER_SIZE / 2 + Math.sin(rad) * RADIUS;
    const y = CONTAINER_SIZE / 2 - Math.cos(rad) * RADIUS;
    return {
      transform: [
        { translateX: x - CONTAINER_SIZE / 2 },
        { translateY: y - CONTAINER_SIZE / 2 },
      ],
    };
  });

  const isMissing = !!(selected && leaBalance < selected.lea);
  const missingAmount = selected ? Math.max(0, selected.lea - Math.floor(leaBalance)) : 0;

  return (
    <Animated.View
      style={[
        { width: CONTAINER_SIZE, height: CONTAINER_SIZE, alignItems: "center", justifyContent: "center" },
        pulseStyle,
      ]}
    >
      <View style={{ position: "absolute", width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={CX} cy={CY}
            r={RADIUS - STROKE_WIDTH / 2 - 1}
            fill="rgba(255,255,255,0.28)"
          />
          <Circle
            cx={CX} cy={CY}
            r={RADIUS}
            fill="none"
            stroke="rgba(0,201,138,0.18)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={[TRACK_DASH, CIRCUMFERENCE - TRACK_DASH]}
            strokeLinecap="round"
            transform={`rotate(${SVG_ROTATION}, ${CX}, ${CY})`}
          />
          {AMOUNTS.map((amount) => {
            const aRad = ((ARC_START_DEG + (amount.lea / MAX_LEA) * ARC_TOTAL_DEG) * Math.PI) / 180;
            const rIn  = RADIUS - STROKE_WIDTH / 2 - 3;
            const rOut = RADIUS + STROKE_WIDTH / 2 + 3;
            return (
              <Line
                key={amount.lea}
                x1={CX + Math.sin(aRad) * rIn}
                y1={CY - Math.cos(aRad) * rIn}
                x2={CX + Math.sin(aRad) * rOut}
                y2={CY - Math.cos(aRad) * rOut}
                stroke={leaBalance >= amount.lea ? EMERALD : "rgba(0,201,138,0.38)"}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
          <AnimatedCircle
            cx={CX} cy={CY}
            r={RADIUS}
            fill="none"
            stroke={EMERALD}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
            animatedProps={progressArcProps}
            transform={`rotate(${SVG_ROTATION}, ${CX}, ${CY})`}
          />
        </Svg>
      </View>

      {leaBalance > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            },
            dotStyle,
          ]}
          pointerEvents="none"
        >
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: EMERALD, opacity: 0.22, position: "absolute" }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: EMERALD_GLOW, position: "absolute" }} />
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white", position: "absolute" }} />
        </Animated.View>
      )}

      <View style={styles.ringCenter}>
        {isMissing ? (
          <>
            <Feather name="alert-circle" size={22} color="#EA580C" />
            <Text style={styles.ringMissingLabel}>Ti mancano</Text>
            <Text style={styles.ringMissingAmount}>{formatLea(missingAmount)} LEA</Text>
          </>
        ) : (
          <>
            <Text style={styles.ringAmount}>{formatLea(leaBalance)}</Text>
            <Image
              source={require("@/assets/images/lea-icon.png")}
              style={styles.ringLeafIcon}
              resizeMode="contain"
            />
          </>
        )}
      </View>

      {AMOUNTS.map((amount) => {
        const angleDeg = ARC_START_DEG + (amount.lea / MAX_LEA) * ARC_TOTAL_DEG;
        const rad = (angleDeg * Math.PI) / 180;
        const px  = CONTAINER_SIZE / 2 + Math.sin(rad) * LABEL_RADIUS;
        const py  = CONTAINER_SIZE / 2 - Math.cos(rad) * LABEL_RADIUS;
        const isReached = leaBalance >= amount.lea;
        const isSel     = selected?.lea === amount.lea;
        return (
          <AmountLabel
            key={amount.lea}
            amount={amount}
            isReached={isReached}
            isSel={isSel}
            px={px}
            py={py}
          />
        );
      })}
    </Animated.View>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user, leaBalance, hasLeafyGold, refreshBalances } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showLeafyGold, setShowLeafyGold] = useState(false);
  const [selected, setSelected]   = useState<typeof AMOUNTS[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPad  = Platform.OS === "web" ? 34 + 84 : 84 + insets.bottom;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshBalances(),
      queryClient.invalidateQueries({ queryKey: ["wallet-withdrawals"] }),
    ]);
    setRefreshing(false);
  }, [refreshBalances, queryClient]);

  const { data: withdrawals, isLoading: loadingWithdrawals } = useQuery<Withdrawal[]>({
    queryKey: ["wallet-withdrawals"],
    queryFn: () => apiFetch("/wallet/withdrawals"),
    enabled: !!user,
    staleTime: 30_000,
  });

  const { mutate: submitWithdrawal, isPending: isSubmitting } = useMutation({
    mutationFn: () =>
      apiFetch<Withdrawal>("/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ leaAmount: selected!.lea }),
      }),
    onSuccess: () => {
      setShowConfirm(false);
      setSelected(null);
      setInlineError(null);
      const euros = selected?.euros ?? 0;
      setSuccessMsg(`Prelievo di €${euros} registrato! Elaborazione entro 24h.`);
      refreshBalances();
      queryClient.invalidateQueries({ queryKey: ["wallet-withdrawals"] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: Error) => {
      setShowConfirm(false);
      setInlineError(err.message);
    },
  });

  const handleTilePress = useCallback((amount: typeof AMOUNTS[0]) => {
    setInlineError(null);
    setSelected((prev) => prev?.euros === amount.euros ? null : amount);
  }, []);

  const handlePayPalPress = useCallback(() => {
    if (!selected) return;

    if (selected.goldOnly && !hasLeafyGold) {
      setShowLeafyGold(true);
      return;
    }

    if (selected.lea > Math.floor(leaBalance)) {
      const missing = selected.lea - Math.floor(leaBalance);
      setInlineError(`Saldo insufficiente. Ti mancano ${formatLea(missing)} LEA.`);
      return;
    }

    setInlineError(null);
    setShowConfirm(true);
  }, [selected, hasLeafyGold, leaBalance]);

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: "#E8F5E9" }]}>
        <MaterialCommunityIcons name="sprout-outline" size={48} color={theme.textMuted} />
        <Text style={[styles.guestTitle, { color: theme.text }]}>Il tuo Raccolto</Text>
        <Text style={[styles.guestSub, { color: theme.textSecondary }]}>
          Accedi per vedere il tuo saldo LEA.
        </Text>
      </View>
    );
  }

  return (
    <>
      <LeafyGoldModal visible={showLeafyGold} onClose={() => setShowLeafyGold(false)} />

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.overlay} onPress={() => !isSubmitting && setShowConfirm(false)}>
          <Pressable style={[styles.confirmCard, { backgroundColor: theme.card }]} onPress={() => {}}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>Conferma prelievo</Text>

            <View style={[styles.confirmPanel, { backgroundColor: "rgba(0,112,224,0.08)", borderColor: "rgba(0,112,224,0.25)" }]}>
              <Text style={[styles.confirmPanelLabel, { color: PAYPAL_BLUE }]}>Riceverai</Text>
              <Text style={[styles.confirmPanelAmount, { color: theme.text }]}>
                €{selected?.euros ?? 0}
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>  ({formatLea(selected?.lea ?? 0)} LEA)</Text>
              </Text>
            </View>

            <Text style={[styles.confirmNote, { color: theme.textSecondary }]}>
              Il pagamento sarà elaborato entro 24h sul tuo account PayPal.
            </Text>

            <View style={styles.confirmBtnRow}>
              <Pressable
                style={[styles.confirmBtnCancel, { borderColor: theme.border }]}
                onPress={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.confirmBtnCancelText, { color: theme.textSecondary }]}>Annulla</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtnConfirm, { backgroundColor: PAYPAL_BLUE }]}
                onPress={() => submitWithdrawal()}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmBtnConfirmText}>Conferma</Text>
                }
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        style={[styles.container, { backgroundColor: "#E8F5E9" }]}
        contentContainerStyle={{ paddingTop: topPadding, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainBlock}>
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.ringSection}>
            <LeafyRing leaBalance={leaBalance} selected={selected} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.gridSection}>
            <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>
              Seleziona importo da prelevare
            </Text>
            <View style={styles.grid}>
              {AMOUNTS.map((amount) => {
                const isSelected   = selected?.euros === amount.euros;
                const isGoldLocked = amount.goldOnly && !hasLeafyGold;
                const notEnough    = !isGoldLocked && amount.lea > Math.floor(leaBalance);

                return (
                  <Pressable
                    key={amount.euros}
                    style={({ pressed }) => [
                      styles.tile,
                      { borderColor: isSelected ? LEAF_GREEN : theme.border, backgroundColor: theme.card },
                      isSelected && styles.tileSelected,
                      (isGoldLocked || notEnough) && styles.tileDimmed,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => handleTilePress(amount)}
                  >
                    <Text style={[styles.tileEuros, { color: isSelected ? LEAF_GREEN : theme.text }]}>
                      €{amount.euros}
                    </Text>
                    <View style={styles.tileLeaRow}>
                      <Text style={[styles.tileLea, { color: theme.textMuted }]}>
                        {formatLea(amount.lea)}
                      </Text>
                      <Image
                        source={require("@/assets/images/lea-icon.png")}
                        style={styles.tileLeaIcon}
                        resizeMode="contain"
                      />
                    </View>
                    {isGoldLocked && (
                      <View style={styles.goldTag}>
                        <Feather name="star" size={8} color="#FFD700" />
                        <Text style={styles.goldTagText}>Gold</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {inlineError && (
            <Animated.View entering={FadeIn} style={[styles.errorBox, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
              <Feather name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.errorText}>{inlineError}</Text>
            </Animated.View>
          )}

          {successMsg && (
            <Animated.View entering={FadeIn} style={[styles.successBox, { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }]}>
              <Feather name="check-circle" size={14} color="#16A34A" />
              <Text style={styles.successText}>{successMsg}</Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Pressable
              style={({ pressed }) => [
                styles.paypalBtn,
                !selected && styles.paypalBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handlePayPalPress}
              disabled={!selected}
            >
              <PayPalLogo width={140} height={34} />
            </Pressable>
          </Animated.View>
        </View>

        {withdrawals && withdrawals.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.historySection, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.historySectionTitle, { color: theme.text }]}>Prelievi recenti</Text>

            {loadingWithdrawals && (
              <ActivityIndicator color={PAYPAL_BLUE} style={{ marginVertical: 16 }} />
            )}

            {withdrawals.slice(0, 5).map((w) => {
              const { label, color } = statusLabel(w.status);
              const date = new Date(w.requestedAt).toLocaleDateString("it-IT", {
                day: "2-digit", month: "short", year: "numeric",
              });
              return (
                <View key={w.id} style={[styles.historyRow, { borderBottomColor: theme.border }]}>
                  <View style={[styles.historyIconWrap, { backgroundColor: "rgba(0,112,224,0.10)" }]}>
                    <Feather name="arrow-up-right" size={16} color={PAYPAL_BLUE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyAmount, { color: theme.text }]}>
                      -{Math.floor(parseFloat(w.leaAmount)).toLocaleString("it-IT")} LEA
                    </Text>
                    <Text style={[styles.historyDate, { color: theme.textMuted }]}>{date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${color}22` }]}>
                    <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  guestTitle: { fontSize: 28, fontFamily: Fonts.displayBold, textAlign: "center" },
  guestSub:   { fontSize: 14, fontFamily: Fonts.bodyRegular, textAlign: "center", lineHeight: 20 },

  mainBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },

  ringSection: {
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ringLeafIcon: {
    width: 48,
    height: 48,
  },
  ringAmount: {
    fontSize: 48,
    fontFamily: Fonts.displayBold,
    color: "#1A3028",
    lineHeight: 56,
    textShadowColor: "rgba(0,201,138,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  ringMissingLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: "#EA580C",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  ringMissingAmount: {
    fontSize: 26,
    fontFamily: Fonts.bodyBold,
    color: "#EA580C",
    lineHeight: 30,
  },

  goldBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFD700",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  goldBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: "#1a4a2e",
  },

  gridSection: { gap: 10 },
  gridLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  tile: {
    flexBasis: "30%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  tileSelected: {
    backgroundColor: "rgba(77,184,71,0.08)",
  },
  tileDimmed: {
    opacity: 0.45,
  },
  tileEuros: {
    fontSize: 28,
    fontFamily: Fonts.displayBold,
    lineHeight: 32,
  },
  tileLea: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
  },
  tileLeaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  tileLeaIcon: {
    width: 12,
    height: 12,
  },
  goldTag: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,215,0,0.18)",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  goldTagText: {
    fontSize: 8,
    fontFamily: Fonts.bodyBold,
    color: "#B8860B",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    color: "#DC2626",
    flex: 1,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  successText: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    color: "#16A34A",
    flex: 1,
    lineHeight: 18,
  },

  paypalBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  paypalBtnDisabled: {
    opacity: 0.45,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: Fonts.displayBold,
    textAlign: "center",
  },
  confirmPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  confirmPanelLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    letterSpacing: 0.5,
  },
  confirmPanelAmount: {
    fontSize: 28,
    fontFamily: Fonts.displayBold,
  },
  confirmNote: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    lineHeight: 18,
  },
  confirmBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  confirmBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  confirmBtnCancelText: {
    fontSize: 15,
    fontFamily: Fonts.bodyMedium,
  },
  confirmBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnConfirmText: {
    fontSize: 15,
    fontFamily: Fonts.bodyBold,
    color: "#fff",
  },

  historySection: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 0,
  },
  historySectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.bodyBold,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  historyAmount: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
  },
});
