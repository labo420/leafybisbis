import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

type AnimalId = "squirrel" | "bird" | "hedgehog" | "butterfly";

const ANIMALS: AnimalId[] = ["squirrel", "bird", "hedgehog", "butterfly"];

const IMAGES: Record<AnimalId, ReturnType<typeof require>> = {
  squirrel: require("@/assets/animals/animal-squirrel.png"),
  bird:     require("@/assets/animals/animal-bird.png"),
  hedgehog: require("@/assets/animals/animal-hedgehog.png"),
  butterfly:require("@/assets/animals/animal-butterfly.png"),
};

const SIZES: Record<AnimalId, number> = {
  squirrel:  80,
  bird:      68,
  hedgehog:  76,
  butterfly: 72,
};

export default function ForestPeeker() {
  const [activeAnimal, setActiveAnimal] = useState<AnimalId | null>(null);
  const fromRightRef = useRef(true);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const tx     = useSharedValue(SW + 100);
  const ty     = useSharedValue(0);
  const scaleY = useSharedValue(1);
  const scaleX = useSharedValue(1);
  const opacity = useSharedValue(0);

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const finish = useCallback(() => {
    busy.current = false;
    setActiveAnimal(null);
  }, []);

  const playAnimal = useCallback((animal: AnimalId, right: boolean) => {
    const size = SIZES[animal];
    const startX = right ? SW + size : -(size * 2);
    const landX  = right ? SW - size - 18 : 18;
    const ringCX = SW / 2 - size / 2;

    tx.value     = startX;
    ty.value     = 0;
    scaleY.value = 1;
    scaleX.value = right ? -1 : 1;
    opacity.value = 1;

    if (animal === "butterfly") {
      // progressSection height ≈ 256px (ring 240 + paddingVertical 8×2)
      // bottom:18 + size:72 → top = 256-18-72 = 166 from container top
      // Ring top at ≈ 8px from container top
      // To land on ring top: translateY = -(166 - 8) = -158
      const LAND_TY = -158;
      const START_TY = LAND_TY - 90; // start above landing spot (off-screen top)

      tx.value = SW + size;
      ty.value = START_TY;

      tx.value = withTiming(ringCX, { duration: 1050, easing: Easing.out(Easing.cubic) });
      ty.value = withTiming(LAND_TY, { duration: 1050, easing: Easing.out(Easing.cubic) });

      scaleY.value = withDelay(
        1100,
        withRepeat(
          withSequence(
            withTiming(0.38, { duration: 120 }),
            withTiming(1.0,  { duration: 120 })
          ),
          8,
          false
        )
      );

      addTimer(() => {
        // Fly away to upper-left
        tx.value = withTiming(-(size * 2), { duration: 950, easing: Easing.in(Easing.cubic) });
        ty.value = withTiming(LAND_TY - 80, { duration: 950, easing: Easing.in(Easing.cubic) });
        addTimer(() => {
          opacity.value = 0;
          finish();
        }, 1000);
      }, 3150);

    } else {
      const BOB_DELAY = 560;
      const BOB_REPS  = 3;
      const BOB_MS    = 700;
      const FLIP_AT   = BOB_DELAY + BOB_REPS * BOB_MS - 180;
      const EXIT_AT   = BOB_DELAY + BOB_REPS * BOB_MS + 120;

      tx.value = withSpring(landX, { damping: 18, stiffness: 120 });

      ty.value = withDelay(
        BOB_DELAY,
        withRepeat(
          withSequence(
            withTiming(-9, { duration: 350 }),
            withTiming(0,  { duration: 350 })
          ),
          BOB_REPS,
          false
        )
      );

      if (animal === "squirrel") {
        addTimer(() => {
          scaleX.value = withTiming(right ? 1 : -1, { duration: 220 });
        }, FLIP_AT);
      }

      addTimer(() => {
        tx.value = withTiming(startX, { duration: 660, easing: Easing.in(Easing.cubic) });
        addTimer(() => {
          opacity.value = 0;
          finish();
        }, 700);
      }, EXIT_AT);
    }
  }, [finish]);

  useEffect(() => {
    if (activeAnimal) {
      playAnimal(activeAnimal, fromRightRef.current);
    }
  }, [activeAnimal]);

  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 22000 + Math.random() * 33000;
      return setTimeout(() => {
        if (!busy.current) {
          busy.current = true;
          const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
          fromRightRef.current = Math.random() > 0.5;
          setActiveAnimal(animal);
        }
        mainTimer = schedule();
      }, delay);
    };

    let mainTimer = schedule();
    return () => {
      clearTimeout(mainTimer);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const animalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scaleY: scaleY.value },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[styles.animal, animalStyle]}>
        {activeAnimal && (
          <Image
            source={IMAGES[activeAnimal]}
            style={{ width: SIZES[activeAnimal], height: SIZES[activeAnimal] }}
            resizeMode="contain"
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  animal: {
    position: "absolute",
    bottom: 18,
  },
});
