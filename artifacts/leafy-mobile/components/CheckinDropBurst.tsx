import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const DROP = require("../assets/images/drop-xp.png");
const RADIUS = 72;
const SIZE = 18;
const N = 8;
const ANGLES = Array.from({ length: N }, (_, i) => (i * Math.PI * 2) / N);

interface DropProps {
  dist: SharedValue<number>;
  alpha: SharedValue<number>;
  angle: number;
}

function Drop({ dist, alpha, angle }: DropProps) {
  const style = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [
      { translateX: Math.cos(angle) * RADIUS * dist.value },
      { translateY: Math.sin(angle) * RADIUS * dist.value },
    ],
  }));
  return (
    <Animated.View style={[styles.drop, style]}>
      <Image source={DROP} style={{ width: SIZE, height: SIZE }} resizeMode="contain" />
    </Animated.View>
  );
}

interface Props {
  dist: SharedValue<number>;
  alpha: SharedValue<number>;
}

export default function CheckinDropBurst({ dist, alpha }: Props) {
  return (
    <View style={styles.origin} pointerEvents="none">
      {ANGLES.map((angle, i) => (
        <Drop key={i} dist={dist} alpha={alpha} angle={angle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: {
    width: 0,
    height: 0,
  },
  drop: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    marginLeft: -(SIZE / 2),
    marginTop: -(SIZE / 2),
  },
});
