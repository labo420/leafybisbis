import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated as RNAnimated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { Fonts } from "@/constants/typography";
import { apiFetch } from "@/lib/api";
import { XpIcon } from "@/components/XpIcon";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CARD_H = 210;
const INITIAL_RADIUS_KM = 5;

interface MapLocation {
  id: number;
  name: string;
  chain: string | null;
  type: "oasi" | "standard";
  address: string | null;
  city: string | null;
  province: string | null;
  lat: number;
  lng: number;
  distanceM: number;
  walkinDrops: number;
}

interface RawMapLocation {
  id: number;
  name: string;
  type: "oasi" | "standard";
  lat: number | string;
  lng: number | string;
  distance_km: number | string;
  chain: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
}

const WALKIN_DROPS: Record<string, number> = { oasi: 15, standard: 5 };

function parseLocation(raw: RawMapLocation): MapLocation {
  const distKm = parseFloat(String(raw.distance_km ?? 0)) || 0;
  return {
    id: raw.id,
    name: raw.name ?? "",
    chain: raw.chain ?? null,
    type: raw.type ?? "standard",
    address: raw.address ?? null,
    city: raw.city ?? null,
    province: raw.province ?? null,
    lat: parseFloat(String(raw.lat)),
    lng: parseFloat(String(raw.lng)),
    distanceM: Math.round(distKm * 1000),
    walkinDrops: WALKIN_DROPS[raw.type] ?? 5,
  };
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function MarkerIcon({ type, selected }: { type: "oasi" | "standard"; selected: boolean }) {
  const bg = type === "oasi" ? "#7C3AED" : "#22C55E";
  const size = selected ? 38 : 30;
  const iconSize = selected ? 18 : 14;
  return (
    <View style={[markerStyles.pin, { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 }]}>
      {type === "oasi" ? (
        <MaterialCommunityIcons name="star" size={iconSize} color="#fff" />
      ) : (
        <MaterialCommunityIcons name="leaf" size={iconSize} color="#fff" />
      )}
      <View style={[markerStyles.pinTail, { borderTopColor: bg }]} />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  pin: {
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pinTail: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#22C55E",
  },
});

export default function MappaScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [permDenied, setPermDenied] = useState(false);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const mapRef = useRef<MapView>(null);

  const cardSlide = useRef(new RNAnimated.Value(CARD_H + 30)).current;

  const showCard = useCallback((loc: MapLocation) => {
    setSelected(loc);
    RNAnimated.spring(cardSlide, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();
  }, [cardSlide]);

  const hideCard = useCallback(() => {
    RNAnimated.timing(cardSlide, {
      toValue: CARD_H + 30,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  }, [cardSlide]);

  const fetchLocations = useCallback(async (lat: number, lng: number) => {
    try {
      const data = await apiFetch<{ locations: RawMapLocation[]; count: number }>(
        `/locations/nearby?lat=${lat}&lng=${lng}&radius=${INITIAL_RADIUS_KM}`,
      );
      setLocations((data.locations ?? []).map(parseLocation));
    } catch {
      // silently fail — map still shows user position
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setPermDenied(true);
        setLoading(false);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        await fetchLocations(latitude, longitude);
      } catch {
        if (!cancelled) setPermDenied(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [fetchLocations]);

  const openDirections = useCallback(() => {
    if (!selected) return;
    const { lat, lng, name } = selected;
    const label = encodeURIComponent(name);
    if (Platform.OS === "ios") {
      Linking.openURL(`maps:0,0?q=${label}&ll=${lat},${lng}`);
    } else {
      Linking.openURL(`geo:0,0?q=${lat},${lng}(${label})`);
    }
  }, [selected]);

  const focusMarker = useCallback((loc: MapLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      latitude: loc.lat - 0.0018,
      longitude: loc.lng,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 400);
    showCard(loc);
  }, [showCard]);

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 }
    : { latitude: 41.9028, longitude: 12.4964, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  const isMapReady = !loading && !permDenied;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => { hideCard(); router.back(); }}
          hitSlop={8}
        >
          <Feather name="chevron-left" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Negozi partner</Text>
        {locations.length > 0 ? (
          <View style={[styles.headerBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.headerBadgeText, { color: theme.leaf }]}>{locations.length}</Text>
          </View>
        ) : <View style={{ width: 36 }} />}
      </View>

      {/* ── LOADING ── */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.leaf} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Ricerca negozi nelle vicinanze…</Text>
        </View>
      )}

      {/* ── PERMISSION DENIED ── */}
      {permDenied && !loading && (
        <View style={styles.centered}>
          <Feather name="map-pin" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Posizione non disponibile</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Abilita la posizione nelle impostazioni per visualizzare i negozi partner.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.settingsBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.settingsBtnText}>Apri impostazioni</Text>
          </Pressable>
        </View>
      )}

      {/* ── MAP ── */}
      {isMapReady && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={() => {
            if (selected) hideCard();
          }}
        >
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              onPress={() => focusMarker(loc)}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false}
            >
              <MarkerIcon type={loc.type} selected={selected?.id === loc.id} />
            </Marker>
          ))}
        </MapView>
      )}

      {/* ── LEGENDA ── */}
      {isMapReady && (
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={[styles.legend, { backgroundColor: theme.card, borderColor: theme.border }]}
          pointerEvents="none"
        >
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#7C3AED" }]} />
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Oasi (+15 Drops)</Text>
          </View>
          <View style={styles.legendDivider} />
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Standard (+5 Drops)</Text>
          </View>
        </Animated.View>
      )}

      {/* ── EMPTY STATE ── */}
      {isMapReady && locations.length === 0 && (
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[styles.emptyBanner, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <MaterialCommunityIcons name="store-off" size={18} color={theme.textMuted} />
          <Text style={[styles.emptyBannerText, { color: theme.textSecondary }]}>
            Nessun negozio entro {INITIAL_RADIUS_KM} km dalla tua posizione
          </Text>
        </Animated.View>
      )}

      {/* ── BOTTOM CARD ── */}
      <RNAnimated.View
        style={[
          styles.bottomCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            paddingBottom: insets.bottom + 12,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        {selected && (
          <>
            <View style={styles.cardHandle} />
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[
                  styles.typeChip,
                  { backgroundColor: selected.type === "oasi" ? "#EDE9FE" : "#DCFCE7" },
                ]}>
                  {selected.type === "oasi" ? (
                    <MaterialCommunityIcons name="star" size={11} color="#7C3AED" />
                  ) : (
                    <MaterialCommunityIcons name="leaf" size={11} color="#16A34A" />
                  )}
                  <Text style={[styles.typeChipText, { color: selected.type === "oasi" ? "#7C3AED" : "#16A34A" }]}>
                    {selected.type === "oasi" ? "Oasi" : "Standard"}
                  </Text>
                </View>
                {selected.chain && (
                  <Text style={[styles.cardChain, { color: theme.textMuted }]} numberOfLines={1}>
                    {selected.chain}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={hideCard}
                hitSlop={12}
                style={({ pressed }) => [styles.closeBtn, { backgroundColor: theme.cardAlt, opacity: pressed ? 0.6 : 1 }]}
              >
                <Feather name="x" size={15} color={theme.textMuted} />
              </Pressable>
            </View>

            <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={2}>{selected.name}</Text>

            <View style={styles.cardMeta}>
              <View style={styles.cardMetaItem}>
                <Feather name="map-pin" size={13} color={theme.textMuted} />
                <Text style={[styles.cardMetaText, { color: theme.textSecondary }]}>
                  {selected.address
                    ? `${selected.address}${selected.city ? `, ${selected.city}` : ""}`
                    : selected.city ?? "—"}
                </Text>
              </View>
              <View style={styles.cardMetaItem}>
                <Feather name="navigation" size={13} color={theme.textMuted} />
                <Text style={[styles.cardMetaText, { color: theme.textSecondary }]}>
                  {formatDistance(selected.distanceM)} di distanza
                </Text>
              </View>
            </View>

            <View style={styles.cardDropRow}>
              <View style={[styles.dropChip, { backgroundColor: theme.primaryLight }]}>
                <XpIcon size={14} />
                <Text style={[styles.dropChipText, { color: theme.leaf }]}>
                  +{selected.walkinDrops} Drops per visita
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.directionsBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={openDirections}
            >
              <Feather name="navigation" size={15} color="#fff" />
              <Text style={styles.directionsBtnText}>Ottieni direzioni</Text>
            </Pressable>
          </>
        )}
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.displayBold,
    flex: 1,
    textAlign: "center",
  },
  headerBadge: {
    width: 36,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.displayBold,
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Fonts.bodyRegular,
    textAlign: "center",
    lineHeight: 20,
  },
  settingsBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  settingsBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    color: "#fff",
  },
  legend: {
    position: "absolute",
    top: 16,
    right: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: Fonts.bodyMedium,
  },
  legendDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  emptyBanner: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBannerText: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    flex: 1,
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    minHeight: CARD_H,
  },
  cardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeChipText: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
  },
  cardChain: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    flex: 1,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 17,
    fontFamily: Fonts.displayBold,
    marginBottom: 8,
    lineHeight: 22,
  },
  cardMeta: {
    gap: 4,
    marginBottom: 10,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: Fonts.bodyRegular,
    flex: 1,
  },
  cardDropRow: {
    marginBottom: 12,
  },
  dropChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  dropChipText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  directionsBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bodyBold,
    color: "#fff",
  },
});
