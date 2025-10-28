import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from "react-native";
import api from "../services/api";

type Invoice = {
    id: string;
    invoiceNumber?: string | null;
    customerName: string;
    totalAmount: number;
    status?: string;
};

const InvoiceListScreen: React.FC = ({ navigation }: any) => {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [page, setPage] = useState(1);

    const fetchInvoices = async (p = 1) => {
        setLoading(true);
        try {
            const resp = await api.get("/invoices", { params: { page: p, limit: 20 } });
            setInvoices(resp.data.data || []);
        } catch (err) {
            console.warn("fetch invoices error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices(page);
    }, [page]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={invoices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={{ fontWeight: "600" }}>{item.invoiceNumber || "—"}</Text>
                        <Text>{item.customerName}</Text>
                        <Text>₹{item.totalAmount?.toFixed(2)}</Text>
                        <Text>Status: {item.status}</Text>
                    </View>
                )}
                ListEmptyComponent={<View style={styles.center}><Text>No invoices</Text></View>}
            />
            <View style={{ padding: 12 }}>
                <Button title="Load more" onPress={() => setPage((s) => s + 1)} />
            </View>
        </View>
    );
};

export default InvoiceListScreen;

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
});