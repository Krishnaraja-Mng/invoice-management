import React, { useState, useContext } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Card, Text, Snackbar } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";

type UserAddScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, "UserAdd">;

interface Props {
    navigation: UserAddScreenNavigationProp;
}

const UserAddScreen: React.FC<Props> = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    role: role.trim() || undefined,
                }),
            });

            if (response.ok) {
                showSnackbar("User created successfully");
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                const data = await response.json();
                showSnackbar(data.message || "Failed to create user");
            }
        } catch (error) {
            showSnackbar("Error creating user");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Add New User" />
                <Card.Content>
                    <TextInput
                        label="Name *"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        error={!!errors.name}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                    <TextInput
                        label="Email *"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    <TextInput
                        label="Password *"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        style={styles.input}
                        secureTextEntry
                        error={!!errors.password}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                    <TextInput
                        label="Role (optional)"
                        value={role}
                        onChangeText={setRole}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Admin, Manager, User"
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            mode="outlined"
                            onPress={() => navigation.goBack()}
                            style={styles.button}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            style={styles.button}
                            loading={loading}
                            disabled={loading}
                        >
                            Create User
                        </Button>
                    </View>
                </Card.Content>
            </Card>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    card: {
        margin: 16,
        elevation: 2,
    },
    input: {
        marginBottom: 8,
    },
    errorText: {
        color: "#d32f2f",
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
    button: {
        flex: 1,
    },
});

export default UserAddScreen;
