import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const loadProfile = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setUser(currentUser);

    // Load full name from Firestore
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setName(docSnap.data().full_name || "");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    if (!user) return;
    try {
      // Update displayName in Firebase Auth (optional)
      await user.updateProfile({ displayName: name });

      // Save full name in Firestore
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { full_name: name }, { merge: true });

      Alert.alert("Profile updated");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert("Logged out");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Profile
      </Text>
      <Text>Email: {user.email}</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, marginTop: 12 }}
      />

      <TouchableOpacity
        onPress={handleUpdate}
        style={{
          backgroundColor: "#0a84ff",
          marginTop: 12,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 16,
          backgroundColor: "#ef4444",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

