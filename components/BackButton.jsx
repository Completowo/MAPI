import { Pressable } from "react-native";
import { BackIcon } from "./Icons";

export function BackButton({ onPress, visible = true }) {
  if (!visible) return null;

  return (
    <Pressable onPress={onPress}>
      <BackIcon />
    </Pressable>
  );
}
