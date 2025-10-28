import "react-native-gesture-handler"; // MUST be at top for gesture handler
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";

enableScreens();

const RootNavigator: React.FC = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <NavigationContainer>{user ? <AppStack /> : <AuthStack />}</NavigationContainer>;
};

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
        </AuthProvider>
    );
}