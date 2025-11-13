import "react-native-gesture-handler"; // must be at top
import "react-native-reanimated";
import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import MenuBar from "./src/components/MenuBar";
import { StatusBar } from "expo-status-bar";

enableScreens();

// InnerNavigator uses AuthContext to render appropriate stack
const InnerNavigator: React.FC = () => {
    const { user } = useContext(AuthContext);
    return <>{user ? <AppStack /> : <AuthStack />}</>;
};

export default function App() {
    return (
        <AuthProvider>
            <PaperProvider>
                <View style={styles.container}>
                    <NavigationContainer>
                        <ConditionalMenuBar />
                        <InnerNavigator />
                    </NavigationContainer>
                    <StatusBar style="auto" />
                </View>
            </PaperProvider>
        </AuthProvider>
    );
}

// ConditionalMenuBar only shows when user is authenticated
const ConditionalMenuBar: React.FC = () => {
    const { user } = useContext(AuthContext);
    // Only show MenuBar when user is logged in
    return user ? <MenuBar /> : null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});