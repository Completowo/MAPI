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
const { width } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Swiper
        loop={false}
        showsPagination={true}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {/* Slides */}
        {slides.map((item, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6EA8FF",
    textAlign: "center",
    marginBottom: 10,
  },

  desc: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 40,
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
    marginTop: 20,
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
