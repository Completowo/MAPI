import { create } from "zustand";

export const useUserStore = create((set) => ({
  // Estado global
  vestimenta: "enfermera",

  // Función para cambiarla
  setVestimenta: (nuevaVestimenta) => set({ vestimenta: nuevaVestimenta }),
}));
