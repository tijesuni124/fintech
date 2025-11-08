import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./lib/firebase"; // your Firebase init
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password");
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: create a Firestore doc for this user
      await setDoc(doc(db, "users", user.uid), {
        full_name: "",
        email: user.email,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully");
      router.replace("/login");
    } catch (error) {
      Alert.alert("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Sign Up
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <TouchableOpacity
        onPress={handleSignup}
        style={{
          backgroundColor: "#10b981",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {loading ? "Creating..." : "Create account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

