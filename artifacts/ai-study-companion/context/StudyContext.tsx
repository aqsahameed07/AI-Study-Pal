import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

export type FlashcardSet = { id: string; title: string; subject: string; cards: { front: string; back: string }[]; createdAt: string };
type StudyContextValue = { sets: FlashcardSet[]; savedPlan: StudyPlan | null; addSet: (set: FlashcardSet) => Promise<void>; savePlan: (plan: StudyPlan) => Promise<void>; clearLocalData: () => Promise<void> };
export type StudyPlan = { subject: string; examDate: string; dailyHours: string; sessions: { day: string; topic: string; duration: string }[] };

const StudyContext = createContext<StudyContextValue | null>(null);
const SETS_KEY = 'study-companion/sets';
const PLAN_KEY = 'study-companion/plan';

export function StudyProvider({ children }: PropsWithChildren) {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [savedPlan, setSavedPlan] = useState<StudyPlan | null>(null);
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(SETS_KEY), AsyncStorage.getItem(PLAN_KEY)]).then(([storedSets, storedPlan]) => {
      if (storedSets) setSets(JSON.parse(storedSets) as FlashcardSet[]);
      if (storedPlan) setSavedPlan(JSON.parse(storedPlan) as StudyPlan);
    });
  }, []);
  const value = useMemo<StudyContextValue>(() => ({
    sets,
    savedPlan,
    addSet: async (set) => { const next = [set, ...sets]; setSets(next); await AsyncStorage.setItem(SETS_KEY, JSON.stringify(next)); },
    savePlan: async (plan) => { setSavedPlan(plan); await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan)); },
    clearLocalData: async () => { setSets([]); setSavedPlan(null); await AsyncStorage.multiRemove([SETS_KEY, PLAN_KEY]); },
  }), [sets, savedPlan]);
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value) throw new Error('useStudy must be used inside StudyProvider');
  return value;
}
