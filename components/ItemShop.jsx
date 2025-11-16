import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
} from "react-native";
import ModalShop from "./ModalShop";
import { supabase } from "../services/supabase";
import { usePointsStore } from "../store/pointsStore";
import { useOpcionesStore } from "../store/optionStore";

export function ItemShop({ pStatus, pPrecio, pItem, interaction, onBought }) {
  const { points, setPoints } = usePointsStore();

  //Zusband agregar traje comprado
  const { addOpcion } = useOpcionesStore();

  const idItem = pItem;
  const status = pStatus;
  const precio = pPrecio;
  const intec = interaction;

  const [visible, setVisible] = useState(false);

  const checkNombreItem = (Item) => {
    var texto = "";
    //console.log(Item);
    switch (Item) {
      case 0:
        return "Enfermera";
      case 1:
        return "Elegante";
      default:
        return "Error";
    }
  };

  const checkImagenItem = (Item) => {
    switch (Item) {
      case 0:
        return (
          <Image
            source={require("../assets/MAPI-emociones/RopaTienda/enfermera.png")}
            style={styles.imagen}
            resizeMode="contain"
          />
        );
      case 1:
        return (
          <Image
            source={require("../assets/MAPI-emociones/RopaTienda/smocking.png")}
            style={styles.imagen}
            resizeMode="contain"
          />
        );
    }
  };

  const checkStatus = (itemStatus) => {
    var texto = `Puntos necesarios\n${precio}`;

    switch (itemStatus) {
      case 0:
        return "Comprado";
      case 1:
        return `Puntos necesarios\n${precio}`;
      case 2:
        return "";
      default:
        return "";
    }
  };
  //Comprar
  const onBuy = async () => {
    if (points >= precio) {
      const newPoints = points - precio; // calcular nuevo valor

      setPoints(newPoints); // actualizar estado global
      setVisible(false);

      onBought();

      addOpcion(checkNombreItem(idItem));
      const nuevasOpciones = useOpcionesStore.getState().opciones;

      // actualizar Supabase
      const { error } = await supabase
        .from("chats")
        .update({ points: newPoints, Skins: nuevasOpciones })
        .eq("id", 2);

      if (error) {
        console.log("Error al actualizar puntos en Supabase:", error);
      }
    } else {
      alert("No tienes suficientes puntos");
    }
  };

  return (
    <View>
      <TouchableOpacity
        disabled={pStatus === 0}
        style={[pStatus === 0 && { opacity: 0.5 }]}
        onPress={() => {
          setVisible(intec);
        }}
      >
        <View style={[styles.contenedor]}>
          <Text style={[styles.titulo]}>{checkNombreItem(idItem)}</Text>
          {checkImagenItem(idItem)}
        </View>
        <Text style={[styles.precio]}>{checkStatus(status)}</Text>
      </TouchableOpacity>

      {/* MODAL*/}
      <ModalShop
        visible={visible}
        onClose={() => setVisible(false)}
        valor={pPrecio}
        imagen={idItem}
        isBought={status === 0}
        onBuy={onBuy}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  contenedor: {
    marginHorizontal: 10,
    marginTop: 10,
    width: 150,
    height: 140,
    backgroundColor: "#d8ebffff",
    borderRadius: 15,
  },

  seleccionado: {
    borderWidth: 3,
    borderBlockColor: "#4EA4FB",
  },

  titulo: {
    marginTop: 10,
    width: "100%",
    textAlign: "center",
    color: "#4EA4FB",
  },

  imagen: {
    marginTop: 10,
    width: "100%",
    height: 80,
  },

  precio: {
    letterSpacing: -0.7,
    marginBottom: -6,
    textAlign: "center",
    color: "#4EA4FB",
  },
});
