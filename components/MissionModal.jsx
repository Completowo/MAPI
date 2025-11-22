import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../services/supabase";

import { usePointsStore } from "../store/pointsStore";
import { useAuthStore } from "../store/useAuthStore";
export default function MissionModal({
  visible,
  onClose,
  title,
  points,
  onComplete,
  onNotComplete,
}) {
  // Estado de puntos desde supabase
  const [pointsSupabase, setPointsSupabase] = useState(0);
  const { points: globalPoints, setPoints, addPoints } = usePointsStore();

  const user_id = useAuthStore((s) => s.pacienteId);
  //Traer puntos desde supabase
  const fecthPoints = async () => {
    const { data, error } = await supabase
      .from("chat")
      .select("points")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.log("Error al obtener el chat", error);
      return [];
    }

    if (!error && data?.points != null) {
      setPointsSupabase(data.points);
    }
  };

  useEffect(() => {
    fecthPoints();
  }, []);

  //Actualizar puntos
  const handleComplete = async () => {
    const sumPoints = pointsSupabase + points;

    setPoints(globalPoints + points);

    try {
      const { error } = await supabase
        .from("chat")
        .update({ points: sumPoints })
        .eq("user_id", user_id);

      if (error) {
        console.log("Error al actualizar puntos", error);
        return;
      }

      onComplete();
      onClose();
    } catch (err) {
      console.error("Error al actualizar puntos:", err);
    }
  };

  const handleReject = () => {
    onNotComplete();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>¿Completaste esta misión?</Text>
          <Text style={styles.subtitle}>
            Esta mision te dará {points} puntos
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.yesBtn} onPress={handleComplete}>
              <Text style={styles.btnText}>✔</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.noBtn} onPress={handleReject}>
              <Text style={styles.btnText}>✖</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "75%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6EA8FF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 50,
    marginBottom: 15,
  },
  yesBtn: {
    backgroundColor: "#3ccf4db9",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  noBtn: {
    backgroundColor: "#ff5252c4",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  btnText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  closeText: {
    marginTop: 10,
    color: "#6EA8FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
