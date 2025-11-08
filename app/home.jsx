import { useEffect, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "./lib/firebase"; // your Firebase init
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

export default function Home() {
  const [summary, setSummary] = useState({
    balance: 0,
    totalDeposits: 0,
    totalWithdraws: 0,
  });
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);

  const screenWidth = Dimensions.get("window").width || 360;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const tx = snapshot.docs.map(doc => doc.data());

      if (!tx) return;

      let balance = 0;
      let deposits = 0;
      let withdraws = 0;
      const last7 = tx.slice(-7);
      const points = last7.map(
        (t) => Number(t.amount) * (t.type === "deposit" ? 1 : -1)
      );
      last7.forEach((t) => {
        if (t.type === "deposit") deposits += Number(t.amount);
        else withdraws += Number(t.amount);
      });
      balance = deposits - withdraws;

      if (mounted) {
        setSummary({ balance, totalDeposits: deposits, totalWithdraws: withdraws });
        const filled = Array(7 - points.length).fill(0).concat(points);
        setChartData(filled);
      }
    };

    load();

    // ✅ Realtime updates with Firestore
    const user = auth.currentUser;
    if (user) {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc")
      );

      const unsubscribe = onSnapshot(q, () => {
        load();
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Dashboard
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#666" }}>Available balance</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", marginTop: 8 }}>
          ${summary.balance.toFixed(2)}
        </Text>
      </View>

      <Text style={{ fontWeight: "700", marginBottom: 8 }}>
        Last transactions (chart)
      </Text>

      <LineChart
        data={{
          labels: ["-6", "-5", "-4", "-3", "-2", "-1", "now"],
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundGradientFrom: "#0a84ff",
          backgroundGradientTo: "#00c6ff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </ScrollView>
  );
}

