import { StyleSheet, Text, View, Button } from "react-native";

export function LastCheck({ mgdl, lastCheck }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.mgdl}>{mgdl}</Text>
        <Text style={styles.unit}>mg/dL</Text>
      </View>
      <Text style={styles.lastCheck}>Último Check: hace {lastCheck} min</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8
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
});
