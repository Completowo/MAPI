import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { TextInput } from "react-native-web";

const doctorLogin2 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BIENVENIDO</Text>
      <Text style={styles.subtitle}>Profesional Médico</Text>
      <View style={styles.content}>
        <View style={styles.loginContainer}>
          <Image
            source={require("../assets/MAPI-emociones/Modal/Despedida.png")}
            style={{
              width: 100,
              height: 100,
              position: "absolute",
              top: -60,
              right: -45,
            }}
          />
          <Image
            source={require("../assets/MAPI-emociones/Burbujas/Burbuja2.png")}
            style={{
              position: "absolute",
              resizeMode: "contain",
              height: 100,
              width: 210,
              top: -130,
              left: 165,
            }}
          />
          <Text
            style={{
              position: "absolute",
              top: -105,
              left: 175,
              textAlign: "center",
              color: "white",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            !Porfavor ingresa tu rut para empezar¡
          </Text>
          <TextInput style={styles.input} placeholder="Ingresa tu Rut" />
          <TextInput style={styles.input} placeholder="Contraseña" />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/RoleSelection")}>
          <Text style={styles.downText}>Volver al Login de pacientes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={{ fontWeight: "bold", color: "#FFFFFF", opacity: 0.5 }}>
          M.A.P.I
        </Text>
        <Text style={{ fontWeight: "bold", color: "#FFFFFF", opacity: 0.5 }}>
          Software
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#757575",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginBottom: 120,
  },
  title: {
    fontSize: 46,
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 80,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 20,
    color: "#ffffffff",
    fontWeight: "500",
    textAlign: "center",
  },
  loginContainer: {
    width: "100%",
    maxWidth: 360,
    gap: 16,
    borderRadius: 25,
    padding: 24,
    borderColor: "#afafafff",
    boxShadow: "0px 6px 6px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#515151",
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#7F7F7F",
    backgroundColor: "#7F7F7F",
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  button: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#515151",
  },
  downText: {
    marginTop: 12,
    color: "#5EC7FF",
    fontSize: 12,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default doctorLogin2;
