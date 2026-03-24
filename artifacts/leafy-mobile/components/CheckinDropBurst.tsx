import React, { useState } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const DROP = require("../assets/images/drop-xp.png");
const RADIUS = 72;
const SIZE = 18;
const N = 8;

function randomAngles(): number[] {
  return Array.from({ length: N }, (_, i) => {
    const base = (i * 360) / N;
    const jitter = (Math.random() - 0.5) * 50;
    return ((base + jitter) * Math.PI) / 180;
  });
}

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
  const [angles] = useState(randomAngles);
  return (
    <>
      {angles.map((angle, i) => (
        <Drop key={i} dist={dist} alpha={alpha} angle={angle} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  drop: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    marginLeft: -(SIZE / 2),
    marginTop: -(SIZE / 2),
  },
});
