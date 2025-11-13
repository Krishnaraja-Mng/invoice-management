import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
    return (
        <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
                headerShown: false, // Hide the navigation header for auth screens
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;