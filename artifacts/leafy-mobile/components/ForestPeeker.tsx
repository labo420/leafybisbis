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

// Frame arrays — each animal has 2-4 sequential frames for animation cycle
const FRAMES: Record<AnimalId, ReturnType<typeof require>[]> = {
  squirrel: [
    require("@/assets/animals/sq-a.png"),
    require("@/assets/animals/sq-b.png"),
  ],
  bird: [
    require("@/assets/animals/bird-a.png"),
    require("@/assets/animals/bird-b.png"),
  ],
  hedgehog: [
    require("@/assets/animals/hog-a.png"),
    require("@/assets/animals/hog-b.png"),
  ],
  butterfly: [
    require("@/assets/animals/fly-a.png"),
    require("@/assets/animals/fly-b.png"),
    require("@/assets/animals/fly-c.png"),
    require("@/assets/animals/fly-d.png"),
  ],
};

// Frame timing in ms per frame
const FRAME_MS: Record<AnimalId, number> = {
  squirrel:  200,
  bird:      140,
  hedgehog:  240,
  butterfly:  85,
};

const SIZES: Record<AnimalId, number> = {
  squirrel:  80,
  bird:      70,
  hedgehog:  76,
  butterfly: 72,
};

export default function ForestPeeker() {
  const [activeAnimal, setActiveAnimal] = useState<AnimalId | null>(null);
  const [frame, setFrame] = useState(0);
  const fromRightRef = useRef(true);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const startFrameLoop = (animal: AnimalId) => {
    if (frameInterval.current) clearInterval(frameInterval.current);
    setFrame(0);
    frameInterval.current = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES[animal].length);
    }, FRAME_MS[animal]);
  };

  const stopFrameLoop = () => {
    if (frameInterval.current) {
      clearInterval(frameInterval.current);
      frameInterval.current = null;
    }
    setFrame(0);
  };

  const finish = useCallback(() => {
    stopFrameLoop();
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

    startFrameLoop(animal);

    if (animal === "butterfly") {
      const LAND_TY = -158;
      const START_TY = LAND_TY - 90;

      tx.value = SW + size;
      ty.value = START_TY;

      tx.value = withTiming(ringCX, { duration: 1050, easing: Easing.out(Easing.cubic) });
      ty.value = withTiming(LAND_TY, { duration: 1050, easing: Easing.out(Easing.cubic) });

      // After landing, slow down wing flap (already handled by frame cycling)
      addTimer(() => {
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
      stopFrameLoop();
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
            source={FRAMES[activeAnimal][frame]}
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
