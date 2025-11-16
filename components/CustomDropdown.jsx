import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

export default function CustomDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
        <Text style={{ color: value ? "#1a3a6b" : "#999" }}>
          {value || "Seleccione una opción"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {options.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.close}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginLeft: 5,
    marginBottom: 5,
    color: "#376ebc",
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#f3f6ff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d7e4ff",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 12,
    padding: 20,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#1a3a6b",
  },
  close: {
    marginTop: 10,
    textAlign: "center",
    color: "#376ebc",
    fontWeight: "600",
    fontSize: 15,
  },
});
