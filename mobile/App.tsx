import React, { useEffect, useState } from "react";
import { Text, View, FlatList } from "react-native";
import axios from "axios";

export default function App() {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        axios
            .get("http://10.0.2.2:4000/invoices") // Android emulator loopback; replace for device
            .then((r) => setInvoices(r.data))
            .catch((e) => console.log("err", e));
    }, []);

    return (
        <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>Invoices</Text>
            <FlatList
                data={invoices}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                    <View style={{ marginBottom: 8 }}>
                        <Text>{item.customerName} — {item.total}</Text>
                    </View>
                )}
            />
        </View>
    );
}