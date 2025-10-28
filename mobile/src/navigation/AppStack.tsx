import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import InvoiceListScreen from "../screens/InvoiceListScreen";

export type AppStackParamList = {
    Home: undefined;
    InvoiceList: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Invoices" }} />
            <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: "My invoices" }} />
        </Stack.Navigator>
    );
};

export default AppStack;