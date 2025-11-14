//Los iconos usados en la app se encuentran aquí expo-vector-icons
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";

export function SettingIcon(props) {
  return <Fontisto name="player-settings" size={24} color="black" {...props} />;
}

export function HomeIcon(props) {
  return <Fontisto name="home" size={24} color="black" {...props} />;
}

export function BellIcon(props) {
  return <Fontisto name="bell" size={24} color="black" {...props} />;
}

export function BackIcon(props) {
  return (
    <Ionicons name="chevron-back-outline" size={24} color="black" {...props} />
  );
}
