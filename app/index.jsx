// app/index.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RootSplash() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // simulate splash, check token/session
      const token = await AsyncStorage.getItem("userToken");
      setTimeout(() => {
        if (token) router.replace("/home");
        else router.replace("/login");
      }, 900);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Fintech</Text>
      <ActivityIndicator size="large" color="#0a84ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: { fontSize: 28, fontWeight: "700", color: "#0a84ff", marginBottom: 16 },
});
