import React, { useContext } from "react";
import { View } from "react-native";
import { Appbar, ActivityIndicator } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import commonStyles from "../styles/common";

const MenuBar: React.FC = () => {
    const { loading, user } = useContext(AuthContext);

    return (
        <Appbar.Header elevated style={commonStyles.headerShadow}>
            <Appbar.Content title="Invoice App" subtitle={user ? `Signed in: ${user.name}` : undefined} />
            <View style={commonStyles.menuRight}>
                {loading ? <ActivityIndicator animating={true} size={20} style={commonStyles.menuIndicator} /> : null}
            </View>
        </Appbar.Header>
    );
};

export default MenuBar;