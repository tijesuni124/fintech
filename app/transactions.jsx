import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "./lib/supabse";

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setHistory(data || []);
  };

  useEffect(() => {
    loadHistory();
    const channel = supabase
      .channel("public:transactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel && supabase.removeChannel(channel);
    };
  }, []);

  const handleTrans = async () => {
    if (!amount || isNaN(Number(amount)))
      return Alert.alert("Enter valid amount");
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const { error } = await supabase.from("transactions").insert({
      user_id: userId,
      type,
      amount: Number(amount),
      description: "",
    });
    if (error) return Alert.alert("Error", error.message);
    setAmount("");
    loadHistory();
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
        keyExtractor={(i) => i.id?.toString()}
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
                {new Date(item.created_at).toLocaleString()}
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
