import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import ModalGlucose from "./ModalGlucose";
import { useAuthStore } from "../store/useAuthStore";

export function LastCheck({ lastCheck }) {
  const [modal, setModal] = useState(false);
  const [glucose, setGlucose] = useState("0");
  const [tempGlucose, setTempGlucose] = useState("");

  //Para calcular ultimo check de glucosa
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [minutesAgo, setMinutesAgo] = useState(0);

  //Constante para abrir modal
  const toggleModal = () => setModal(!modal);

  const user_id = useAuthStore((s) => s.pacienteId);
  //Cargar el valor desde Supabase al iniciar
  useEffect(() => {
    //LLamar a mgdl y fecha para el lastCheck
    const fetchGlucose = async () => {
      const { data, error } = await supabase
        .from("chat")
        .select("mgdl, last_check")
        .eq("user_id", user_id)
        .single();

      if (!error) {
        setGlucose(data?.mgdl || "0");
        setLastCheckTime(data?.last_check);
      }
    };

    fetchGlucose();
  }, []);

  useEffect(() => {
    if (!lastCheckTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const last = new Date(lastCheckTime);
      const diffMs = now - last;
      const diffMin = Math.floor(diffMs / 60000);

      setMinutesAgo(diffMin);
    }, 1000); // si quieres cada minuto pon 60000

    return () => clearInterval(interval);
  }, [lastCheckTime]);

  //Guardar en Supabase
  const handleConfirm = async () => {
    try {
      setGlucose(tempGlucose);
      toggleModal();

      const { error } = await supabase
        .from("chat")
        .update({ mgdl: tempGlucose, last_check: new Date() })
        .eq("user_id", user_id);

      if (error) console.error("Error guardando glucosa:", error);
      else console.log("✅ Glucosa guardada correctamente:", tempGlucose);
      setLastCheckTime(new Date());
      setTempGlucose("");
    } catch (err) {
      console.error("Error al guardar en Supabase:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.mgdl}>{glucose}</Text>
        <Text style={styles.unit}>mg/dL</Text>
      </View>

      <Text style={styles.lastCheck}>Último Check: hace {minutesAgo} min</Text>

      <TouchableOpacity style={styles.mainButton} onPress={toggleModal}>
        <Text style={styles.mainButtonText}>Tomar Glucosa</Text>
      </TouchableOpacity>

      <ModalGlucose
        visible={modal}
        onClose={toggleModal}
        onSave={handleConfirm}
        tempGlucose={tempGlucose}
        setTempGlucose={setTempGlucose}
      />

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
