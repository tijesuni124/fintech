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
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");
  const [history, setHistory] = useState([]);

  const user = auth.currentUser;
  if (!user) Alert.alert("Error", "User not logged in");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc")
    );

    // realtime listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((t) => t.userId === user.uid); // only current user
      setHistory(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTrans = async () => {
    if (!amount || isNaN(Number(amount))) return Alert.alert("Enter valid amount");
    if (!user) return;

    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type,
        amount: Number(amount),
        description: "",
        createdAt: new Date(),
      });
      setAmount("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Transactions
      </Text>

      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setType("deposit")}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: type === "deposit" ? "#10b981" : "#e5e7eb",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: type === "deposit" ? "#fff" : "#111" }}>
              Deposit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType("withdraw")}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: type === "withdraw" ? "#ef4444" : "#e5e7eb",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: type === "withdraw" ? "#fff" : "#111" }}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleTrans}
          style={{
            marginTop: 12,
            backgroundColor: "#0a84ff",
            padding: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Submit</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        History
      </Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              backgroundColor: "#fff",
              borderRadius: 8,
              marginBottom: 8,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontWeight: "700" }}>{item.type}</Text>
              <Text style={{ color: "#666", fontSize: 12 }}>
                {item.createdAt.toDate
                  ? item.createdAt.toDate().toLocaleString()
                  : new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text
              style={{
                color: item.type === "deposit" ? "green" : "red",
                fontWeight: "700",
              }}
            >
              ${Number(item.amount).toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

