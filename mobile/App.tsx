import "react-native-gesture-handler"; // must be at top
import "react-native-reanimated";
import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import MenuBar from "./src/components/MenuBar";
import { StatusBar } from "expo-status-bar";

enableScreens();

const RootNavigator: React.FC = () => {
    // NavigationContainer will display stacks; MenuBar sits above navigation content
    return (
        <NavigationContainer>
            {/* The stacks will render below the MenuBar */}
            <AuthStack />
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <PaperProvider>
                <View style={styles.container}>
                    <MenuBar />
                    <NavigationContainer>
                        {/* The RootNavigator logic (switch between Auth/App stacks) is handled inside AuthProvider in AuthContext */}
                        {/* We'll render stacks conditionally by consuming AuthContext in a small wrapper inside navigation or by using separate navigators */}
                        {/* For simplicity, use a small component that switches stacks based on stored token (AuthContext does that in earlier implementation) */}
                        <InnerNavigator />
                    </NavigationContainer>
                    <StatusBar style="auto" />
                </View>
            </PaperProvider>
        </AuthProvider>
    );
}

// InnerNavigator uses AuthContext to render appropriate stack. Keep it local so App.tsx stays clean.
import { useContext } from "react";
import { AuthContext } from "./src/context/AuthContext";

const InnerNavigator: React.FC = () => {
    const { user } = useContext(AuthContext);
    return <>{user ? <AppStack /> : <AuthStack />}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});