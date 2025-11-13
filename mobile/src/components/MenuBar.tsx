import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, ActivityIndicator, Menu } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import commonStyles from "../styles/common";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MenuBar: React.FC = () => {
    const { loading, user } = useContext(AuthContext);
    const navigation = useNavigation<NavigationProp>();
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const openUserMenu = () => setUserMenuVisible(true);
    const closeUserMenu = () => setUserMenuVisible(false);

    const handleUserList = () => {
        closeUserMenu();
        navigation.navigate("UserList");
    };

    const handleUserAdd = () => {
        closeUserMenu();
        navigation.navigate("UserAdd");
    };

    return (
        <Appbar.Header elevated style={commonStyles.headerShadow}>
            <Appbar.Content title="Invoice App" subtitle={user ? `Signed in: ${user.name}` : undefined} />
            <View style={styles.menuRight}>
                {loading ? <ActivityIndicator animating={true} size={20} style={commonStyles.menuIndicator} /> : null}
                
                <Menu
                    visible={userMenuVisible}
                    onDismiss={closeUserMenu}
                    anchor={
                        <Appbar.Action 
                            icon="account-multiple" 
                            onPress={openUserMenu}
                        />
                    }
                >
                    <Menu.Item 
                        onPress={handleUserList} 
                        title="Search & List Users" 
                        leadingIcon="account-search"
                    />
                    <Menu.Item 
                        onPress={handleUserAdd} 
                        title="Add User" 
                        leadingIcon="account-plus"
                    />
                </Menu>
            </View>
        </Appbar.Header>
    );
};

const styles = StyleSheet.create({
    menuRight: {
        flexDirection: "row",
        alignItems: "center",
    },
});

export default MenuBar;