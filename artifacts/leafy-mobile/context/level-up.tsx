import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth";
import type { Profile } from "@workspace/api-client-react";
import LevelUpModal from "@/components/LevelUpModal";

const PREV_LEVEL_KEY_PREFIX = "leafy_prev_level:";
const WATERING_CAN_DURATION_MS = 2700;

export type RingLayout = { x: number; y: number; width: number; height: number };
export type LevelUpPhase = "idle" | "animating" | "exploded";

interface LevelUpContextValue {
  checkForLevelUp: () => void;
  levelUpPhase: LevelUpPhase;
  levelUpToLevel: string;
  ringTargetLayout: RingLayout | null;
  setRingLayout: (layout: RingLayout) => void;
}

const LevelUpContext = createContext<LevelUpContextValue>({
  checkForLevelUp: () => {},
  levelUpPhase: "idle",
  levelUpToLevel: "",
  ringTargetLayout: null,
  setRingLayout: () => {},
});

export function useLevelUp() {
  return useContext(LevelUpContext);
}

export function LevelUpProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [fromLevel, setFromLevel] = useState("");
  const [toLevel, setToLevel] = useState("");
  const [phase, setPhase] = useState<LevelUpPhase>("idle");
  const [ringTargetLayout, setRingTargetLayout] = useState<RingLayout | null>(null);
  const prevLevelRef = useRef<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const levelUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = user?.id ? `${PREV_LEVEL_KEY_PREFIX}${user.id}` : null;

  const { data: profile, refetch } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/profile"),
    enabled: !!user,
  });

  useEffect(() => {
    setStorageReady(false);
    prevLevelRef.current = null;
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored) prevLevelRef.current = stored;
      setStorageReady(true);
    });
  }, [storageKey]);

  useEffect(() => {
    if (!profile?.level || !storageReady || !storageKey) return;
    const currentLevel = profile.level;

    if (prevLevelRef.current && prevLevelRef.current !== currentLevel && !visible) {
      const from = prevLevelRef.current;
      if (levelUpTimeoutRef.current) clearTimeout(levelUpTimeoutRef.current);
      setPhase("animating");
      levelUpTimeoutRef.current = setTimeout(() => {
        setFromLevel(from);
        setToLevel(currentLevel);
        setVisible(true);
        levelUpTimeoutRef.current = null;
      }, WATERING_CAN_DURATION_MS);
    }

    prevLevelRef.current = currentLevel;
    AsyncStorage.setItem(storageKey, currentLevel);
  }, [profile?.level, visible, storageKey, storageReady]);

  useEffect(() => {
    return () => {
      if (levelUpTimeoutRef.current) clearTimeout(levelUpTimeoutRef.current);
      if (phaseResetRef.current) clearTimeout(phaseResetRef.current);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") refetch();
    });
    return () => sub.remove();
  }, [user, refetch]);

  const checkForLevelUp = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleModalClose = useCallback(() => {
    setVisible(false);
    setPhase("exploded");
    if (phaseResetRef.current) clearTimeout(phaseResetRef.current);
    phaseResetRef.current = setTimeout(() => {
      setPhase("idle");
      phaseResetRef.current = null;
    }, 400);
  }, []);

  const setRingLayout = useCallback((layout: RingLayout) => {
    setRingTargetLayout(layout);
  }, []);

  return (
    <LevelUpContext.Provider value={{
      checkForLevelUp,
      levelUpPhase: phase,
      levelUpToLevel: toLevel,
      ringTargetLayout,
      setRingLayout,
    }}>
      {children}
      <LevelUpModal
        visible={visible}
        fromLevel={fromLevel}
        toLevel={toLevel}
        ringTargetLayout={ringTargetLayout}
        onClose={handleModalClose}
      />
    </LevelUpContext.Provider>
  );
}
