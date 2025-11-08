import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "./lib/firebase"; // your Firebase init
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";

export default function Watchlist() {
  const [symbol, setSymbol] = useState("");
  const [list, setList] = useState([]);

  const user = auth.currentUser;
  if (!user) Alert.alert("Error", "User not logged in");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "watchlist"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setList(data);
    });

    return () => unsubscribe();
  }, [user]);

  const addSymbol = async () => {
    if (!symbol || !user) return;

    try {
      await addDoc(collection(db, "watchlist"), {
        userId: user.uid,
        symbol: symbol.toUpperCase(),
        createdAt: new Date(),
      });
      setSymbol("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const removeSymbol = async (id) => {
    try {
      await deleteDoc(doc(db, "watchlist", id));
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        Watchlist
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextInput
          placeholder="Symbol e.g. AAPL"
          value={symbol}
          onChangeText={setSymbol}
          style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 }}
        />
        <TouchableOpacity
          onPress={addSymbol}
          style={{ padding: 12, backgroundColor: "#0a84ff", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 12,
              backgroundColor: "#fff",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{item.symbol}</Text>
            <TouchableOpacity
              onPress={() => removeSymbol(item.id)}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ color: "#ef4444" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

