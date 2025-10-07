import { StyleSheet, Text, View, Button } from "react-native";
import { StatusBar } from "react-native-web";

export function Points({ points }) {
  return (
    <View style={styles.points}>
      <Text>Mis puntos:</Text>
      <Text>{points}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  points: {
    backgroundColor: "#83C1FF",
    fontSize: 10,
    height: 40, // altura suficiente para mostrar el contenido
    alignItems: "center",
    justifyContent: "center", // centra verticalmente
    paddingHorizontal: 16, // opcional, para espacio lateral
    borderRadius: 12, // opcional, para esquinas redondeadas
  },
});
