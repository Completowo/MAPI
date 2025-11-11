import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";

//ESTO ES PARA EXPORTAR LA GLUCOSA A OTROS COMPONENTES
let currentGlucose = "0";
export function getGlucose() {
  return currentGlucose;
}

export function LastCheck({ mgdl, lastCheck }) {
  const [modal, setModal] = useState(false);
  const [glucose, setGlucose] = useState("0");
  const [tempGlucose, setTempGlucose] = useState("");

  const toggleModal = () => setModal(!modal);

  const handleConfirm = () => {
    setGlucose(tempGlucose);
    currentGlucose = tempGlucose;
    toggleModal();
    console.log("Glucosa actualizada a:", currentGlucose);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.mgdl}>{glucose}</Text>
        <Text style={styles.unit}>mg/dL</Text>
      </View>
      <Text style={styles.lastCheck}>Último Check: hace {lastCheck} min</Text>

      <TouchableOpacity style={styles.mainButton} onPress={toggleModal}>
        <Text style={styles.mainButtonText}>Tomar Glucosa</Text>
      </TouchableOpacity>

      <Modal animationType="fade" visible={modal} transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            {/* Imagen mapi */}
            <Image
              source={require("../assets/mapiGlucose.png")}
              style={{
                width: 200,
                height: 200,
                marginBottom: 1,
                position: "absolute",
                right: -80,
                top: -100,
              }}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Nuevo valor de glucosa</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: 120"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              onChangeText={setTempGlucose}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleConfirm}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  mgdl: {
    fontSize: 96,
    color: "#83C1FF",
    fontWeight: "300",
    lineHeight: 96,
  },
  unit: {
    color: "#83C1FF",
    fontSize: 16,
    marginBottom: 8,
  },
  lastCheck: {
    color: "#83C1FF",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  line: {
    width: "90%",
    height: 1,
    backgroundColor: "#E6F3FF",
    alignSelf: "center",
    marginTop: 8,
  },
  mainButton: {
    backgroundColor: "#3A8DFF",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  mainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#F2F6FF",
    borderRadius: 10,
    height: 45,
    paddingLeft: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#3A8DFF",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 6,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
