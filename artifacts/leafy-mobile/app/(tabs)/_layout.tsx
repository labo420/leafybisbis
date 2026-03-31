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
  withSpring,
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

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(focused ? -2 : 0, {
          damping: 15,
          stiffness: 150,
        }),
      },
      {
        scale: withSpring(focused ? 1.08 : 1, { damping: 15, stiffness: 150 }),
      },
    ],
  }));

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.iconPill, pillStyle]} />
      <Animated.View style={iconStyle}>
        <MaterialCommunityIcons name={iconName} size={26} color={color} />
      </Animated.View>
    </View>
  );
}

function FloatingScanButton({ focused }: { focused: boolean }) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(pulseScale);
    pulseScale.value = 1;
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
          <MaterialCommunityIcons name="camera-outline" size={24} color="#fff" />
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
          <XpIcon size={18} />
          <Text style={styles.balanceChipValue}>{drops.toLocaleString("it-IT")}</Text>
        </View>
        <View style={styles.balanceSeparator} />
        <View style={styles.balanceChip}>
          <LeaIcon size={18} />
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

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
          tabBarIconStyle: {
            overflow: "visible",
          },
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
          listeners={{ tabPress: triggerHaptic }}
        />
        <Tabs.Screen
          name="sfide"
          options={{
            title: "Sfide",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                focused={focused}
                color={color}
                iconName={focused ? "trophy" : "trophy-outline"}
              />
            ),
          }}
          listeners={{ tabPress: triggerHaptic }}
        />
        <Tabs.Screen
          name="storico"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scansiona",
            tabBarIcon: ({ focused }) => <FloatingScanButton focused={focused} />,
            tabBarLabel: () => null,
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
          listeners={{ tabPress: triggerHaptic }}
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
          listeners={{ tabPress: triggerHaptic }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceBar: {
    backgroundColor: "#2E6B50",
    paddingTop: 5,
    paddingBottom: 7,
    paddingHorizontal: 18,
  },
  balanceInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  balanceChipValue: {
    fontSize: 21,
    fontFamily: Fonts.bodyBold,
    color: "#ffffff",
  },
  balanceChipLeaLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: "#AADF2A",
    letterSpacing: 0.5,
  },
  balanceSeparator: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 1,
  },
  iconContainer: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  iconPill: {
    borderRadius: 14,
  },
  scanBtnOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  scanBtnGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(46,107,80,0.18)",
  },
  proBadgeIcon: {
    position: "absolute",
    top: 1,
    right: -2,
    width: 28,
    height: 28,
  },
});
