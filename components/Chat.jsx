import { View, Text, StyleSheet } from "react-native";

export function Chat({ text, isThinking, sender = "assistant" }) {
  const isUser = sender === "user";

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={styles.chatContainer}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            isThinking && styles.thinkingBubble,
          ]}
        >
          <Text style={[styles.text, isUser && styles.userText]}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    width: "100%",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  chatContainer: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: 12,
  },
  bubble: {
    backgroundColor: "rgba(131, 193, 255, 0.2)",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: "90%", // Un poco menos para que no ocupe todo el ancho
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6EA8FF",
  },
  thinkingBubble: {
    backgroundColor: "rgba(200, 200, 200, 0.2)",
  },
  text: {
    color: "#6EA8FF",
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: "#FFFFFF",
  },
});
