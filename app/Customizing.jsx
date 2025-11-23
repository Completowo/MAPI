import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { Header } from "../components/Header";
import CustomDropdown from "../components/CustomDropdown";

import { useUserStore } from "../store/useUserStore";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../store/useAuthStore";

export default function Customizing() {
  //Id usuario
  const user_id = useAuthStore((s) => s.pacienteId);

  const vestimenta = useUserStore((state) => state.vestimenta);
  const setVestimenta = useUserStore((state) => state.setVestimenta);

  const [opciones, setOpciones] = useState(["Enfermera"]); // valor por defecto

  //Traer trajes desde Supabase
  const fetchSkins = async () => {
    const { data, error } = await supabase
      .from("chat")
      .select("skins, selected_skin")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.log("Error al obtener el chat desde customizing", error);
      return { skins: ["Enfermera"], selected: "Enfermera" };
    }

    return {
      skins: data?.skins || ["Enfermera"],
      selected: data?.selected_skin || "Enfermera",
    };
  };

  useEffect(() => {
    const cargar = async () => {
      const { skins, selected } = await fetchSkins();
      setOpciones(skins);
      setVestimenta(selected);
    };

    cargar();
  }, []);

  const saveDress = async (skin) => {
    const { error } = await supabase
      .from("chat")
      .update({ selected_skin: skin })
      .eq("user_id", user_id);

    if (error) {
      console.log("Error al guardar el chat desde customizing", error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Personalización" />

      <View style={{ padding: 20 }}>
        <CustomDropdown
          label="Selecciona tu vestimenta"
          options={opciones}
          value={vestimenta}
          onChange={(nuevaVestimenta) => {
            setVestimenta(nuevaVestimenta);
            saveDress(nuevaVestimenta);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  current: {
    fontSize: 16,
    marginBottom: 20,
    color: "#777",
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#E9F4FF",
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: "#6EA8FF",
  },
  optionText: {
    color: "#6EA8FF",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "white",
  },
});
