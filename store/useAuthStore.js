import { create } from "zustand";
import { persist, createJSONStorage } from "expo-zustand-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create(
  persist(
    (set) => ({
      pacienteId: null,

      setPacienteId: (id) => set({ pacienteId: id }),

      clearUser: () => set({ pacienteId: null }),
    }),
    {
      name: "user-data",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
