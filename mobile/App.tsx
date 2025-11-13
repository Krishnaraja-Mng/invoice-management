import "react-native-gesture-handler"; // must be at top
import "react-native-reanimated";
import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import MenuBar from "./src/components/MenuBar";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { theme } from "./src/theme";

enableScreens();

// InnerNavigator uses AuthContext to render appropriate stack
const InnerNavigator: React.FC = () => {
    const { user } = useContext(AuthContext);
    return <>{user ? <AppStack /> : <AuthStack />}</>;
};

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                'Ubuntu-Regular': require('./assets/fonts/Ubuntu-Regular.ttf'),
                'Ubuntu-Medium': require('./assets/fonts/Ubuntu-Medium.ttf'),
                'Ubuntu-Light': require('./assets/fonts/Ubuntu-Light.ttf'),
            });
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return null; // or a loading screen
    }

    return (
        <AuthProvider>
            <PaperProvider theme={theme}>
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