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

export default function Watchlist() {
  const [symbol, setSymbol] = useState("");
  const [list, setList] = useState([]);

  const loadList = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setList(data || []);
  };

  useEffect(() => {
    loadList();
  }, []);

  const addSymbol = async () => {
    if (!symbol) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const { error } = await supabase
      .from("watchlist")
      .insert({ user_id: userId, symbol: symbol.toUpperCase() });
    if (error) return Alert.alert("Error", error.message);
    setSymbol("");
    loadList();
  };

  const removeSymbol = async (id) => {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) return Alert.alert("Error", error.message);
    loadList();
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
        keyExtractor={(i) => i.id.toString()}
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
