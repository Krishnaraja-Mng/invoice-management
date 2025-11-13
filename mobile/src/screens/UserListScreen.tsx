import React, { useState, useEffect, useContext } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Text, IconButton, Searchbar, FAB, Snackbar } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";
import { API_URL } from "../config";

type UserListScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, "UserList">;

interface Props {
    navigation: UserListScreenNavigationProp;
}

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    isActive: boolean;
}

const UserListScreen: React.FC<Props> = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            } else {
                showSnackbar("Failed to load users");
            }
        } catch (error) {
            showSnackbar("Error loading users");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const renderUserCard = ({ item }: { item: User }) => (
        <Card style={styles.card} onPress={() => navigation.navigate("UserEdit", { userId: item.id })}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.userInfo}>
                    <Text variant="titleMedium" style={styles.userName}>
                        {item.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.userEmail}>
                        {item.email}
                    </Text>
                    {item.role && (
                        <Text variant="bodySmall" style={styles.userRole}>
                            Role: {item.role}
                        </Text>
                    )}
                </View>
                <IconButton icon="chevron-right" size={24} onPress={() => navigation.navigate("UserEdit", { userId: item.id })} />
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search users by name or email"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />
            <FlatList
                data={filteredUsers}
                renderItem={renderUserCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadUsers} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge" style={styles.emptyText}>
                            {searchQuery ? "No users found" : "No users available"}
                        </Text>
                    </View>
                }
            />
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate("UserAdd")}
                label="Add User"
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    searchBar: {
        margin: 16,
        elevation: 2,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        elevation: 2,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        color: "#666",
        marginBottom: 2,
    },
    userRole: {
        color: "#888",
        fontStyle: "italic",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyText: {
        color: "#999",
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default UserListScreen;
