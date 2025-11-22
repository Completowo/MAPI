import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { Header } from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Setting() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await useAuthStore.persist.clearStorage();
    useAuthStore.getState().clearUser();
    router.push("/RoleSelection");
  };

  return (
    <View style={styles.container}>
      {/*Header */}
      <View style={styles.header}>
        <Header title="Configuración" />
      </View>
      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("/Customizing")}
        >
          <Text style={styles.optionText}>Personalización</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.optionText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});
