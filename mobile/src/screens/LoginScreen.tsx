import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

type Props = NativeStackScreenProps<any>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { signIn } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const onSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Validation", "Please enter email and password");
            return;
        }
        setSaving(true);
        const result = await signIn(email.trim(), password);
        setSaving(false);
        if (!result.ok) {
            Alert.alert("Login failed", result.message || "Unknown error");
        }
        // on success, navigation changes via AuthContext
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!saving}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!saving}
            />
            {saving ? <ActivityIndicator /> : <Button title="Sign in" onPress={onSubmit} />}
            <View style={{ height: 12 }} />
            <Button title="Create account" onPress={() => navigation.navigate("Register")} />
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center" },
    title: { fontSize: 24, marginBottom: 16, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 12, borderRadius: 6 },
});