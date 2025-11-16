import { StyleSheet, Text, View, Button, Image } from "react-native";
import { Switch } from "react-native-web";

export function ItemShop({pStatus, pPrecio, pItem}) {
  const idItem = pItem;
  const status = pStatus;
  const precio = pPrecio;


  const checkNombreItem = (Item) => {
    var texto = "";
    //console.log(Item);
    switch (Item) {
      case 0:
        return "Enfermera"
      case 1:
        return "Elegante"
      default:
        return "Error"
    } 
  }

  const checkImagenItem = (Item) => {
    switch (Item) {
      case 0:
        return <Image source={require('../assets/MAPI-emociones/RopaTienda/enfermera.png')} style={styles.imagen} resizeMode="contain"/>;
      case 1:
        return <Image source={require('../assets/MAPI-emociones/RopaTienda/smocking.png')} style={styles.imagen} resizeMode="contain"/>;
    } 
  }
  
  const checkStatus = (itemStatus) => {
    var texto = `Puntos necesarios\n${precio}`

    switch (itemStatus) {
      case 0:
        return "Comrpado"
      case 1:
        return `Puntos necesarios\n${precio}`
      case 2:
        return ""
      default: 
        return ""
    }
  }
    
  return (
    <View>
      <View style={[styles.contenedor]}>
        <Text style={[styles.titulo]}>{checkNombreItem(idItem)}</Text>
        {checkImagenItem(idItem)}
      </View>
      <Text style={[styles.precio]}>{checkStatus(status)}</Text>
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
    borderBlockColor: "#4EA4FB"
  },

  titulo: {
    marginTop: 10,
    width: "100%",
    textAlign:"center",
    color: "#4EA4FB",

  },

  imagen: {
    marginTop: 10,
    width: "100%",
    height:80,
  },

  precio: {
    letterSpacing: -0.7,
    marginBottom: -6,
    textAlign:"center",
    color: "#4EA4FB",
  }
});
