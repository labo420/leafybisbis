import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { XpIcon } from "@/components/XpIcon";
import { LeaIcon } from "@/components/LeaIcon";
import { Fonts } from "@/constants/typography";
import { useAuth } from "@/context/auth";
import { useScanReset } from "@/context/scan-reset";
import { useTheme } from "@/context/theme";

type MCIconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function TabIcon({
  focused,
  iconName,
  color,
}: {
  focused: boolean;
  iconName: MCIconName;
  color: string;
}) {
  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      focused ? "rgba(46,107,80,0.18)" : "rgba(46,107,80,0)",
      { damping: 15, stiffness: 120 }
    ),
    transform: [
      { scale: withSpring(focused ? 1 : 0.92, { damping: 15, stiffness: 120 }) },
    ],
  }));

  return (
    <Animated.View style={[styles.activeIconWrap, pillStyle]}>
      <MaterialCommunityIcons name={iconName} size={28} color={color} />
    </Animated.View>
  );
}

function FloatingScanButton({ focused }: { focused: boolean }) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!focused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1600 }),
          withTiming(1.0, { duration: 1600 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1);
    }
  }, [focused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const focusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 1) }],
  }));

  return (
    <Animated.View style={[pulseStyle]}>
      <Animated.View
        style={[
          styles.scanBtnOuter,
          focusStyle,
          { shadowColor: theme.leaf },
        ]}
      >
        <LinearGradient
          colors={[theme.leaf, "#23533e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scanBtnGradient}
        >
          <MaterialCommunityIcons name="camera-outline" size={30} color="#fff" />
        </LinearGradient>
      </Animated.View>
      {focused && <View style={styles.scanBtnRing} />}
    </Animated.View>
  );
}

function BalanceBar() {
  const { user, drops, leaBalance } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.balanceBar}>
      <View style={styles.balanceInner}>
        <View style={styles.balanceChip}>
          <XpIcon size={16} />
          <Text style={styles.balanceChipValue}>{drops.toLocaleString("it-IT")}</Text>
        </View>
        <View style={styles.balanceSeparator} />
        <View style={styles.balanceChip}>
          <LeaIcon size={16} />
          <Text style={styles.balanceChipLeaLabel}>LEA</Text>
          <Text style={styles.balanceChipValue}>{Math.floor(leaBalance)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const insets = useSafeAreaInsets();
  const { user, hasLeafyGold } = useAuth();
  const { triggerReset, triggerCamera } = useScanReset();
  const { theme, mode } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        style="light"
        backgroundColor={user ? "#2E6B50" : mode === "dark" ? "#121212" : "#2E6B50"}
      />
      <View
        style={{
          backgroundColor: user ? "#2E6B50" : undefined,
          paddingTop: insets.top,
        }}
      >
        <BalanceBar />
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: Fonts.bodyMedium,
            marginBottom: 0,
          },
          tabBarStyle: {
            backgroundColor: isIOS ? "transparent" : theme.card,
            borderTopWidth: 0,
            elevation: 0,
            height: 84 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            overflow: "visible",
            display: !user ? "none" : "flex",
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint={mode === "dark" ? "dark" : "light"}
                style={[
                  StyleSheet.absoluteFill,
                  { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
                ]}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: theme.card,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                  },
                ]}
              />
            ),
          tabBarItemStyle: {
            paddingTop: 8,
            paddingHorizontal: 4,
            gap: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                focused={focused}
                color={color}
                iconName={focused ? "home-variant" : "home-variant-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="storico"
          options={{
            title: "Storico",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                focused={focused}
                color={color}
                iconName={focused ? "receipt-text" : "receipt-text-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scansiona",
            tabBarIcon: ({ focused }) => <FloatingScanButton focused={focused} />,
            tabBarItemStyle: {
              top: -20,
            },
          }}
          listeners={{
            tabPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              triggerReset();
              triggerCamera();
            },
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Raccolto",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                focused={focused}
                color={color}
                iconName={focused ? "sprout" : "sprout-outline"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profilo"
          options={{
            title: "Profilo",
            tabBarIcon: ({ color, focused }) => (
              <View>
                <TabIcon
                  focused={focused}
                  color={color}
                  iconName={focused ? "account-circle" : "account-circle-outline"}
                />
                {hasLeafyGold && (
                  <Image
                    source={require("@/assets/images/leafy-gold-icon.png")}
                    style={styles.proBadgeIcon}
                    resizeMode="contain"
                  />
                )}
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceBar: {
    backgroundColor: "#2E6B50",
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  balanceInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceChipValue: {
    fontSize: 32,
    fontFamily: Fonts.bodyBold,
    color: "#ffffff",
  },
  balanceChipLeaLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodyBold,
    color: "#AADF2A",
    letterSpacing: 0.5,
  },
  balanceSeparator: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 1,
  },
  activeIconWrap: {
    borderRadius: 14,
    padding: 6,
    overflow: "visible",
  },
  scanBtnOuter: {
    width: 79,
    height: 79,
    borderRadius: 39.5,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  scanBtnGradient: {
    width: 73,
    height: 73,
    borderRadius: 36.5,
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnRing: {
    position: "absolute",
    width: 91,
    height: 91,
    borderRadius: 45.5,
    borderWidth: 3,
    borderColor: "rgba(46,107,80,0.20)",
  },
  proBadgeIcon: {
    position: "absolute",
    bottom: -6,
    right: -8,
    width: 18,
    height: 18,
  },
});
