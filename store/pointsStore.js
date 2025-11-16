import { create } from "zustand";

export const usePointsStore = create((set) => ({
  points: 0,

  setPoints: (newPoints) => set({ points: newPoints }),
  addPoints: (amount) => set((state) => ({ points: state.points + amount })),
}));
