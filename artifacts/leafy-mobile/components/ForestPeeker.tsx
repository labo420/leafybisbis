import React, { useEffect, useRef, useState } from "react";
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

const SCREEN_W = Dimensions.get("window").width;

type AnimalId = "squirrel" | "bird" | "hedgehog" | "butterfly";
const ANIMALS: AnimalId[] = ["squirrel", "bird", "hedgehog", "butterfly"];

const FRAMES: Record<AnimalId, ReturnType<typeof require>[]> = {
  squirrel: [require("@/assets/animals/sq-a.png"), require("@/assets/animals/sq-b.png")],
  bird:     [require("@/assets/animals/bird-a.png"), require("@/assets/animals/bird-b.png")],
  hedgehog: [require("@/assets/animals/hog-a.png"), require("@/assets/animals/hog-b.png")],
  butterfly: [
    require("@/assets/animals/fly-a.png"),
    require("@/assets/animals/fly-b.png"),
    require("@/assets/animals/fly-c.png"),
    require("@/assets/animals/fly-d.png"),
  ],
};

const FRAME_MS: Record<AnimalId, number> = {
  squirrel: 200, bird: 140, hedgehog: 240, butterfly: 85,
};
const SIZES: Record<AnimalId, number> = {
  squirrel: 80, bird: 70, hedgehog: 76, butterfly: 72,
};

type Session = { animal: AnimalId; fromRight: boolean };

export default function ForestPeeker() {
  const [session, setSession] = useState<Session | null>(null);
  const [frame, setFrame] = useState(0);

  const tx      = useSharedValue(SCREEN_W + 100);
  const ty      = useSharedValue(0);
  const scaleX  = useSharedValue(1);
  const opacity = useSharedValue(0);

  const busyRef         = useRef(false);
  const mountedRef      = useRef(true);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimers      = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  function stopFrameLoop() {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }

  function startFrameLoop(animal: AnimalId) {
    stopFrameLoop();
    setFrame(0);
    frameIntervalRef.current = setInterval(() => {
      setFrame(f => (f + 1) % FRAMES[animal].length);
    }, FRAME_MS[animal]);
  }

  function addTimer(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    animTimers.current.push(id);
  }

  function clearAnimTimers() {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
    stopFrameLoop();
  }

  function finish() {
    clearAnimTimers();
    busyRef.current = false;
    if (mountedRef.current) {
      opacity.value = withTiming(0, { duration: 150 });
      setTimeout(() => {
        if (mountedRef.current) setSession(null);
      }, 160);
    }
  }

  function play(animal: AnimalId, fromRight: boolean) {
    console.log("[ForestPeeker] play:", animal, fromRight ? "right" : "left", "SW:", SCREEN_W);
    const size   = SIZES[animal];
    const startX = fromRight ? SCREEN_W + size : -(size * 2);
    const landX  = fromRight ? SCREEN_W - size - 18 : 18;

    tx.value     = startX;
    ty.value     = 0;
    scaleX.value = fromRight ? -1 : 1;
    opacity.value = 1;

    startFrameLoop(animal);

    if (animal === "butterfly") {
      const LAND_TY  = -158;
      const START_TY = LAND_TY - 90;
      ty.value = START_TY;
      tx.value = withTiming(SCREEN_W / 2 - size / 2, { duration: 1050, easing: Easing.out(Easing.cubic) });
      ty.value = withTiming(LAND_TY, { duration: 1050, easing: Easing.out(Easing.cubic) });

      addTimer(() => {
        tx.value = withTiming(-(size * 2), { duration: 950, easing: Easing.in(Easing.cubic) });
        ty.value = withTiming(LAND_TY - 80, { duration: 950, easing: Easing.in(Easing.cubic) });
        addTimer(() => finish(), 1000);
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
          scaleX.value = withTiming(fromRight ? 1 : -1, { duration: 220 });
        }, FLIP_AT);
      }

      addTimer(() => {
        tx.value = withTiming(startX, { duration: 660, easing: Easing.in(Easing.cubic) });
        addTimer(() => finish(), 700);
      }, EXIT_AT);
    }
  }

  const playRef = useRef(play);
  playRef.current = play;

  useEffect(() => {
    if (session) {
      playRef.current(session.animal, session.fromRight);
    }
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    let scheduleTimer: ReturnType<typeof setTimeout>;
    let firstFire = true;

    const scheduleNext = () => {
      const delay = firstFire ? 3000 : 25000 + Math.random() * 20000;
      firstFire = false;
      console.log("[ForestPeeker] next animal in", Math.round(delay / 1000), "s");
      scheduleTimer = setTimeout(() => {
        if (!cancelled) {
          if (!busyRef.current) {
            busyRef.current = true;
            const animal    = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
            const fromRight = Math.random() > 0.5;
            console.log("[ForestPeeker] timer fired → setSession:", animal);
            setSession({ animal, fromRight });
          }
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      clearTimeout(scheduleTimer);
      clearAnimTimers();
      busyRef.current = false;
    };
  }, []);

  const animalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scaleX: scaleX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[styles.animal, animalStyle]}>
        {session && (
          <Image
            source={FRAMES[session.animal][frame]}
            style={{ width: SIZES[session.animal], height: SIZES[session.animal] }}
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
    bottom: 26,
  },
});
