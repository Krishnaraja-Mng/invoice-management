import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import InvoiceListScreen from "../screens/InvoiceListScreen";
import UserListScreen from "../screens/UserListScreen";
import UserAddScreen from "../screens/UserAddScreen";
import UserEditScreen from "../screens/UserEditScreen";

export type AppStackParamList = {
    Home: undefined;
    InvoiceList: undefined;
    UserList: undefined;
    UserAdd: undefined;
    UserEdit: { userId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Invoices" }} />
            <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: "My invoices" }} />
            <Stack.Screen name="UserList" component={UserListScreen} options={{ title: "Users" }} />
            <Stack.Screen name="UserAdd" component={UserAddScreen} options={{ title: "Add User" }} />
            <Stack.Screen name="UserEdit" component={UserEditScreen} options={{ title: "Edit User" }} />
        </Stack.Navigator>
    );
};

export default AppStack;