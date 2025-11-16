import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Text,
} from "react-native";

// Import de componentes
import { Points } from "../components/Points";
import { ItemShop } from "../components/ItemShop";
import { SettingIcon, BellIcon, ShopIcon } from "../components/Icons";

export default function Shop() {
  const nPoints = 250;

  return (
    


    <View style={[styles.content]}>
      
      <View style={[styles.modalBG]}>
        <View style={[styles.modalContainer]}>
          <ItemShop pStatus={2} pPrecio={500} pItem={1}></ItemShop>
        </View>
      </View>
      
      
      <View style={[styles.header]}>
        <View style={[styles.points]}>
          <Points points={nPoints} />
        </View>

        <View style={styles.icons}>
          <ShopIcon onPress={() => router.push("/Shop")} />
          <BellIcon />
          <SettingIcon onPress={() => router.push("/Setting")} />
        </View>
      </View>



      <Text style={[styles.title]}>TIENDA</Text>
      <Text style={[styles.subTitle]}>Accesorios</Text>

      <ScrollView style={[styles.scroll]} showsVerticalScrollIndicator = {false}>
        <View style={[styles.c_Items]}>
          <ItemShop pStatus={0} pPrecio={0} pItem={0}></ItemShop>
          <ItemShop pStatus={1} pPrecio={500} pItem={1}></ItemShop>
          <View style={{height: 100, width: "100%"}}></View> 
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
  },

  header: {
    position: "relative",
    width: "100%",
    height: 70,
    //backgroundColor: "#ffb1b1ff",
    flexDirection: "row",
  },

  points: {
    position: "absolute",
    left: 20,
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
    width:"100%",
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
    width:"100%",
    textAlign: "center",
    marginTop: 0,
    fontSize: 17,
    fontFamily: "Arial",
    fontWeight: "300",
    color: "#4EA4FB",
    //backgroundColor: "#ffb1b1ff",
  },

  c_Items: {
    maxWidth:"100%",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  }, 

  scroll: {
    marginTop: 50,
  },

  modalBG: {
    display: "none",
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', //Centered horizontally
    flex:1,
    zIndex: 10,
    position: "absolute",
    height: "100%",
    width: "100%",
    bottom: 0,
    backgroundColor: "#00000085",
  },

  modalContainer: {
    width: 300,
    minHeight: 140,
    backgroundColor: "#fff",
  }

});
