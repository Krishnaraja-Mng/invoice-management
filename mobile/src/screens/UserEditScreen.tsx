import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Card, Text, Snackbar, ActivityIndicator } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppStack";

type UserEditScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, "UserEdit">;
type UserEditScreenRouteProp = RouteProp<AppStackParamList, "UserEdit">;

interface Props {
    navigation: UserEditScreenNavigationProp;
    route: UserEditScreenRouteProp;
}

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    isActive: boolean;
}

const UserEditScreen: React.FC<Props> = ({ navigation, route }) => {
    const { userId } = route.params;
    const { token } = useContext(AuthContext);
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setName(data.name);
                setEmail(data.email);
                setRole(data.role || "");
            } else {
                showSnackbar("Failed to load user");
                navigation.goBack();
            }
        } catch (error) {
            showSnackbar("Error loading user");
            console.error(error);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

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

        if (password && password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const updateData: any = {
                name: name.trim(),
                email: email.trim(),
                role: role.trim() || undefined,
            };

            if (password.trim()) {
                updateData.password = password;
            }

            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                showSnackbar("User updated successfully");
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                const data = await response.json();
                showSnackbar(data.message || "Failed to update user");
            }
        } catch (error) {
            showSnackbar("Error updating user");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = () => {
        Alert.alert(
            "Deactivate User",
            `Are you sure you want to deactivate ${user?.name}? They will no longer be able to log in.`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: confirmDeactivate,
                },
            ]
        );
    };

    const confirmDeactivate = async () => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                showSnackbar("User deactivated successfully");
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                const data = await response.json();
                showSnackbar(data.message || "Failed to deactivate user");
            }
        } catch (error) {
            showSnackbar("Error deactivating user");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading user...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Edit User" subtitle={user?.isActive ? "Active" : "Inactive"} />
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
                        label="Password (leave empty to keep current)"
                        value={password}
                        onChangeText={setPassword}
                        mode="outlined"
                        style={styles.input}
                        secureTextEntry
                        error={!!errors.password}
                        placeholder="Enter new password or leave empty"
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
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.button}
                            loading={saving}
                            disabled={saving}
                        >
                            Save Changes
                        </Button>
                    </View>

                    {user?.isActive && (
                        <Button
                            mode="contained"
                            onPress={handleDeactivate}
                            style={styles.deactivateButton}
                            buttonColor="#d32f2f"
                            disabled={saving}
                        >
                            Deactivate User
                        </Button>
                    )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        marginTop: 16,
        color: "#666",
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
    deactivateButton: {
        marginTop: 24,
    },
});

export default UserEditScreen;
