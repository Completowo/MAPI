import { create } from "zustand";

export const useOpcionesStore = create((set) => ({
  opciones: ["Enfermera"],

  addOpcion: (nombre) =>
    set((state) => {
      if (state.opciones.includes(nombre)) return state;
      return { opciones: [...state.opciones, nombre] };
    }),
}));
