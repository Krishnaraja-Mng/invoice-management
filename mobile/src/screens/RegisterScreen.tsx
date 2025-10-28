import React, { useContext, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const RegisterScreen: React.FC<any> = ({ navigation }) => {
    const { signUp } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const onSubmit = async () => {
        if (!name || !email || password.length < 6) {
            Alert.alert("Validation", "Please enter name, email and a password >= 6 characters");
            return;
        }
        setSaving(true);
        const result = await signUp(name.trim(), email.trim(), password);
        setSaving(false);
        if (!result.ok) {
            Alert.alert("Register failed", result.message || "Unknown error");
            return;
        }
        // on success, AuthContext will update and navigation switches
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>
            <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} editable={!saving} />
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!saving}
            />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} editable={!saving} />
            {saving ? <ActivityIndicator /> : <Button title="Register" onPress={onSubmit} />}
            <View style={{ height: 12 }} />
            <Button title="Have an account? Sign in" onPress={() => navigation.navigate("Login")} />
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center" },
    title: { fontSize: 24, marginBottom: 16, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 12, borderRadius: 6 },
});