import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MissionModal from "./MissionModal";

export function Missions({ title }) {
  const [visible, setVisible] = useState(false);

  //Estado para saber si la misión está completada
  const [completed, setCompleted] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          completed && { backgroundColor: "#A5D6A7" }, //Si está completada, se pone verde
        ]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.title,
            completed && { color: "#1B5E20", fontWeight: "bold" }, //Texto verde oscuro para las letras
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>

      <MissionModal
        visible={visible}
        onClose={() => setVisible(false)}
        title={title}
        //Le pasamos esta función al modal para que actualice el estado a completada
        onComplete={() => {
          setCompleted(true);
          setVisible(false);
        }}
        // Le pasamos esta función al modal para que actualice el estado a no completada
        onNotComplete={() => {
          setCompleted(false);
          setVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#E9F4FF",
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 8,
    alignSelf: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: "#6EA8FF",
    fontWeight: "500",
  },
});
