import { StyleSheet, Text, View, Button } from "react-native";

export function Points({ points }) {
  return (
    <View style={styles.points}>
      <Text style={styles.text}>Mis puntos:</Text>
      <Text style={styles.text}>{points}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  points: {
    backgroundColor: "#E6F3FF",
    fontSize: 12,
    height: 40, // altura suficiente para mostrar el contenido
    alignItems: "center",
    justifyContent: "center", // centra verticalmente
    paddingHorizontal: 16, // opcional, para espacio lateral
    borderRadius: 10, // opcional, para esquinas redondeadas
    color: "#016ad3ff",
    marginVertical: 12,
  },
  text: {
    color: "#83C1FF",
  },
});
