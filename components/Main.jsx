import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Points } from "./Points";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SettingIcon, HomeIcon, BellIcon } from "./Icons";
import { LastCheck } from "./LastCheck";
import { Missions } from "./Missions";

export function Main() {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Points points={210} />
        <View style={styles.icons}>
          <BellIcon />
          <SettingIcon />
        </View>
      </View>
      <LastCheck mgdl={90} lastCheck={26} />
      <Missions title={"Camina durante 30 minutos"} progress={0.35} />
      <Missions title={"Haste un Check"} progress={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // centra Points horizontalmente
    position: "relative",
  },
  icons: {
    position: "absolute",
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
