import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Text,
  Modal,
} from "react-native";

// Import de componentes
import { Points } from "../components/Points";
import { ItemShop } from "../components/ItemShop";
import { SettingIcon, BellIcon, ShopIcon } from "../components/Icons";
import { Header } from "../components/Header";

export default function Shop() {
  return (
    <View style={[styles.content]}>
      <Header title="Tienda" />
      <View style={[styles.header]}>
        <Points />
      </View>

      <Text style={[styles.title]}>TIENDA</Text>
      <Text style={[styles.subTitle]}>Accesorios</Text>

      <ScrollView style={[styles.scroll]} showsVerticalScrollIndicator={false}>
        <View style={[styles.c_Items]}>
          <ItemShop pStatus={0} pPrecio={0} pItem={0}></ItemShop>
          <ItemShop pStatus={1} pPrecio={500} pItem={1}></ItemShop>
          <View style={{ height: 100, width: "100%" }}></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "scroll",
    backgroundColor: "white",
    flex: 1,
  },

  header: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 70,
    //backgroundColor: "#ffb1b1ff",
    flexDirection: "row",
  },

  icons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    //backgroundColor: "red"
  },

  title: {
    width: "100%",
    textAlign: "center",
    marginTop: 30,
    marginBlock: -15,
    fontSize: 50,
    fontFamily: "Arial",
    fontWeight: "900",
    color: "#4EA4FB",
    //backgroundColor: "#ffb1b1ff",
  },
  subTitle: {
    width: "100%",
    textAlign: "center",
    marginTop: 0,
    fontSize: 17,
    fontFamily: "Arial",
    fontWeight: "300",
    color: "#4EA4FB",
    //backgroundColor: "#ffb1b1ff",
  },

  c_Items: {
    maxWidth: "100%",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  scroll: {
    marginTop: 50,
  },
});
