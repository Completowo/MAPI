import { create } from "zustand";
import { supabase } from "../services/supabase";

export const useUserStore = create((set) => ({
  // Estado global
  vestimenta: "enfermera",

  // Cambiar vestimenta ***y guardarla en Supabase***
  setVestimenta: async (nuevaVestimenta, user_id) => {
    set({ vestimenta: nuevaVestimenta });

    if (!user_id) return;

    // Guardarla en Supabase
    await supabase
      .from("chat")
      .update({ selected_skin: nuevaVestimenta })
      .eq("user_id", user_id);
  },

  // Cargar vestimenta desde Supabase al entrar a la app
  loadVestimenta: async (user_id) => {
    const { data, error } = await supabase
      .from("chat")
      .select("selected_skin")
      .eq("user_id", user_id)
      .single();

    if (!error && data?.selected_skin) {
      set({ vestimenta: data.selected_skin });
    }
  },
}));
