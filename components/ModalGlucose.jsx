import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";

export default function ModalGlucose({
  visible,
  onClose,
  onSave,
  tempGlucose,
  setTempGlucose,
}) {
  return (
    <Modal animationType="fade" visible={visible} transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalCard}>
          <Image
            source={require("../assets/mapiGlucose.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.modalTitle}>Nuevo valor de glucosa</Text>

          <TextInput
            style={styles.textInput}
            placeholder="Ej: 120"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={tempGlucose}
            onChangeText={setTempGlucose}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 200,
    height: 200,
    position: "absolute",
    right: -80,
    top: -100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6EA8FF",
    marginBottom: 20,
  },
  textInput: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#6EA8FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButtonText: { color: "#444", fontWeight: "600" },
});
