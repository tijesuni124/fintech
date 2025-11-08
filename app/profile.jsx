import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "./lib/supabse";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  const loadProfile = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();
    // If using built-in auth user metadata, replace accordingly.
    if (!error && data) {
      setUser(data);
      setName(data.full_name || "");
    } else {
      // fallback: populate name from session user metadata if available
      const { data: sessionUser } = await supabase.auth.getUser();
      setUser(sessionUser?.user || null);
      setName(sessionUser?.user?.user_metadata?.full_name || "");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    // Update user metadata in Supabase Auth (user_metadata)
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (error) return Alert.alert("Error", error.message);
    Alert.alert("Profile updated");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Profile
      </Text>
      <Text>Email: {user.email || user?.user?.email}</Text>
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
