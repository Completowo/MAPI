import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Missions({ title, progress }) {
  // progress debe ser un número entre 0 y 1 (por ejemplo 0.35 para 35%)
  const completed = progress >= 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${completed ? 100 : progress * 100}%` },
          ]}
        />
        <Text
          style={[styles.progressText, completed && styles.completedTextInside]}
        >
          {completed ? "¡Completada!" : `${Math.round(progress * 100)}%`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#E9F4FF",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    color: "#6EA8FF",
    marginBottom: 8,
    fontWeight: "500",
  },
  barContainer: {
    width: "85%",
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#6EA8FF",
    borderRadius: 10,
  },
  progressText: {
    textAlign: "center",
    fontSize: 12,
    color: "#0f61f8ff",
    fontWeight: "500",
  },
  completedTextInside: {
    color: "white",
    fontWeight: "600",
  },
});
