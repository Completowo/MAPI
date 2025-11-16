import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import CustomDropdown from "../components/CustomDropdown";

import { useUserStore } from "../store/useUserStore";

export default function Customizing() {
  const vestimenta = useUserStore((state) => state.vestimenta);
  const setVestimenta = useUserStore((state) => state.setVestimenta);

  const opciones = ["Enfermera", "Elegante"];

  return (
    <View style={styles.container}>
      <View>
        <Header title="Personalización" />
      </View>
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
