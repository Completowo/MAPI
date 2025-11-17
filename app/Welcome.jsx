import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";
import slides from "../slides";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0080ff86", "#cdddecff", "#ffffffff"]}
        style={{ flex: 1 }}
      >
        <Swiper
          loop={false}
          showsPagination={true}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
        >
          {/* Slides */}
          {slides.map((item, index) => (
            <View key={index} style={styles.slide}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>

              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />

              {/* Botón solo en el último */}
              {index === slides.length - 1 && (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => router.replace("/RoleSelection")}
                >
                  <Text style={styles.btnText}>Comenzar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </Swiper>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0080ff94" },

  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
    marginLeft: 120,
    resizeMode: "contain",
    position: "absolute",
    bottom: 100,
  },

  title: {
    fontSize: 42,
    fontWeight: "700",
    color: "#007FFF",
    textAlign: "center",
    marginBottom: 60,
  },

  desc: {
    fontSize: 18,
    color: "#007FFF",
    textAlign: "center",
    marginBottom: 400,
  },

  dot: {
    backgroundColor: "#D0D0D0",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#6EA8FF",
    width: 22,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  btn: {
    backgroundColor: "#6EA8FF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: -20,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
