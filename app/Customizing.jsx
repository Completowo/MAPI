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
import { Picker } from "@react-native-picker/picker";

export default function Customizing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/*Header */}
      <View>
        <Header title="Personalización" />
      </View>
      {/* Content */}
      <View style={styles.pickerContainer}>
        <Picker dropdownIconColor="#376ebc">
          <Picker.Item label="Seleccione vestimenta" value="" />
          <Picker.Item label="Enfermera" value="enfermera" />
          <Picker.Item label="Elegante" value="elegante" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
});
