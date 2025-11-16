import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { ItemShop } from "./ItemShop";
import { Points } from "./Points";

export default function ModalShop({ visible, onClose, valor, imagen, onBuy }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* BOTÓN CERRAR */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/*IMAGEN MAPI */}
          <View>
            <Image
              source={require("../assets/MAPI-emociones/Modal/Confusa.png")}
              style={{
                width: 100,
                height: 100,
                position: "absolute",
                top: -75,
                right: -45,
              }}
            />
          </View>

          <View>
            <View style={styles.row}>
              {/* LADO IZQUIERDO */}
              <View>
                <ItemShop pItem={imagen} interaction={false} />
              </View>

              {/* LADO DERECHO */}
              <View style={styles.rightBox}>
                <View
                  style={{
                    width: "85%",
                  }}
                >
                  <Points />
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Puntos necesarios:</Text>
                  <Text style={styles.infoValue}>{valor}</Text>
                </View>

                <TouchableOpacity style={styles.buyBtn} onPress={onBuy}>
                  <Text style={styles.buyText}>Comprar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  modalBox: {
    width: "95%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 5,
    left: 10,
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#59AFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 50,
  },
  closeText: {
    fontSize: 22,
    color: "#59AFFF",
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
  },
  leftBox: {
    width: "45%",
    backgroundColor: "#EAF4FF",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "#59AFFF",
    marginBottom: 10,
  },
  rightBox: {
    width: "55%",
    paddingLeft: 5,
    justifyContent: "center",
  },
  infoCard: {
    backgroundColor: "#EAF4FF",
    paddingVertical: 2,
    borderRadius: 10,
    width: "85%",
    alignItems: "center",
  },
  infoTitle: {
    color: "#83C1FF",
    fontSize: 14,
  },
  infoValue: {
    color: "#83C1FF",
    fontSize: 14,
  },
  buyBtn: {
    width: "85%",
    marginTop: 8,
    backgroundColor: "#59AFFF",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  buyText: {
    color: "white",
    fontSize: 16,
  },
});
