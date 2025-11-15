import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { BackButton } from "../components/BackButton";

export function Header({ title = "" }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <BackButton onPress={() => router.back()} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: "#6EA8FF",
  },
});
