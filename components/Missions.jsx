import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Missions({ title, progress }) {
  // progress debe ser un número entre 0 y 1 (por ejemplo 0.35 para 35%)
  const completed = progress >= 1;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        {!completed && (
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        )}
      </View>

      {completed && <Text style={styles.completedText}>¡Completada!</Text>}
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
    height: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
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
    color: "#6EA8FF",
  },
  completedText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6EA8FF",
    fontWeight: "600",
  },
});
