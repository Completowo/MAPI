import { Pressable } from "react-native";
import { BackIcon } from "./Icons";

export function BackButton({ onPress }) {
  return (
    <Pressable onPress={onPress}>
      <BackIcon />
    </Pressable>
  );
}
