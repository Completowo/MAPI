import { View, Text, StyleSheet } from "react-native";

export function Chat({ text }) {
  return (
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <View style={styles.bubble}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  chatContainer: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  bubble: {
    backgroundColor: "rgba(131, 193, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 1,
    maxWidth: "100%",
  },
  text: {
    color: "#6EA8FF",
    fontSize: 13,
    lineHeight: 18,
  },
});
