import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { supabase } from "../services/supabase";
import { usePointsStore } from "../store/pointsStore";

export function Points() {
  const { points, setPoints } = usePointsStore();

  const id = "2";
  //Traer puntos desde supabase
  const fecthPoints = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("points")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error al obtener el chat", error);
      return [];
    }

    return {
      points: data?.points || 0,
    };
  };

  //Actualizar puntos
  useEffect(() => {
    const loadPoints = async () => {
      const { points } = await fecthPoints();
      setPoints(points);
    };

    loadPoints();
  }, []);

  return (
    <View style={styles.points}>
      <Text style={styles.text}>Mis puntos:</Text>
      <Text style={styles.text}>{points}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  points: {
    backgroundColor: "#E6F3FF",
    fontSize: 12,
    height: 40, // altura suficiente para mostrar el contenido
    alignItems: "center",
    justifyContent: "center", // centra verticalmente
    paddingHorizontal: 16, // opcional, para espacio lateral
    borderRadius: 10, // opcional, para esquinas redondeadas
    color: "#016ad3ff",
    marginVertical: 12,
  },
  text: {
    color: "#83C1FF",
  },
});
