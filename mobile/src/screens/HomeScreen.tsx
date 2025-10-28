import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

const HomeScreen: React.FC = ({ navigation }: any) => {
    const { user, signOut } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome{user ? `, ${user.name}` : ""}</Text>
            <Text style={{ marginBottom: 16 }}>This is a placeholder Home screen. Implement invoice list here.</Text>
            <Button title="My invoices" onPress={() => navigation.navigate("InvoiceList")} />
            <View style={{ height: 12 }} />
            <Button title="Sign out" onPress={() => signOut()} />
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, marginBottom: 8 },
});