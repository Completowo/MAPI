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
      .select("skins")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.log("Error al obtener el chat desde customizing", error);
      return ["Enfermera"];
    }

    return data?.skins || ["Enfermera"];
  };

  useEffect(() => {
    const cargar = async () => {
      const skins = await fetchSkins();
      setOpciones(skins);
    };

    cargar();
  }, []);

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
