//Imports de React
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//Imports de Iconos
import { SettingIcon, HomeIcon, BellIcon } from "./Icons";

//Imports de Componentes
import { Points } from "./Points";
import { LastCheck } from "./LastCheck";
import { Missions } from "./Missions";
import { Chat } from "./Chat";

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
      <View
        style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 50 }}
      >
        <View style={{ flex: 1 }}>
          <Chat text="Hola, soy M.A.P.I., tu asistente personal." />
          <Chat text="¿Cómo has estado el día de hoy?" />
          <Chat text="El día de hoy tus niveles de azúcar en sangre se encuentran bastante bien, sigue así." />
        </View>
        <Image
          source={require("../assets/mapi.png")}
          style={{ width: 150, height: 225, marginRight: 10 }}
          resizeMode="contain"
        />
      </View>
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
