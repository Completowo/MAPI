import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MissionModal from "./MissionModal";

export function Missions({ title, progress = 0 }) {
  const [visible, setVisible] = useState(false);

  // Estado de completado
  const [completed, setCompleted] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={() => setVisible(true)}>
        {/* Título */}
        <Text style={styles.title}>{title}</Text>

        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              completed ? { width: "100%" } : { width: `${progress * 100}%` },
            ]}
          />

          {/* Texto sobre la barra */}
          <Text style={styles.progressText}>
            {completed ? "¡Completada!" : `${Math.round(progress * 100)}%`}
          </Text>
        </View>
      </TouchableOpacity>

      <MissionModal
        visible={visible}
        onClose={() => setVisible(false)}
        title={title}
        onComplete={() => {
          setCompleted(true);
          setVisible(false);
        }}
        onNotComplete={() => {
          setCompleted(false);
          setVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#d3e6f8ff",
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 8,
    alignSelf: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 14,
    color: "#6EA8FF",
    fontWeight: "500",
    marginBottom: 6,
  },

  progressBar: {
    width: "85%",
    height: 30,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#6EA8FF",
  },

  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#bad0f1ff",
  },
});
