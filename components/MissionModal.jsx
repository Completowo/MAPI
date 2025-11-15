import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function MissionModal({
  visible,
  onClose,
  title,
  onComplete,
  onNotComplete,
}) {
  const handleComplete = () => {
    onComplete();
    onClose();
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
