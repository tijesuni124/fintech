import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./lib/firebase"; // your Firebase init

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Check your email", "Password reset link sent.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 30 }}>
        Forgot Password
      </Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          marginBottom: 15,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={handleReset}
        style={{
          backgroundColor: "#ff6600",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Send Reset Link
        </Text>
      </TouchableOpacity>

      <Link
        href="/login"
        style={{ textAlign: "center", marginTop: 15, color: "#007bff" }}
      >
        Back to Login
      </Link>
    </View>
  );
}

