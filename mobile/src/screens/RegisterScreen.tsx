import React, { useContext, useState } from "react";
import {
    View,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import commonStyles, { CARD_MAX_WIDTH } from "../styles/common";

/**
 * Same adjustments as LoginScreen:
 * - KAV uses flex:1 and keyboardVerticalOffset
 * - ScrollView uses flexGrow centering
 * - Card width limited by computedWidth and maxHeight in common styles
 */
const RegisterScreen: React.FC<any> = ({ navigation }: any) => {
    const { signUp } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const window = useWindowDimensions();
    const horizontalPadding = 32;
    const computedWidth = Math.min(window.width - horizontalPadding, CARD_MAX_WIDTH);

    const onSubmit = async () => {
        if (!name || !email || password.length < 6) return;
        setSaving(true);
        const result = await signUp(name.trim(), email.trim(), password);
        setSaving(false);
        if (!result.ok) {
            // show error
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView contentContainerStyle={commonStyles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={[commonStyles.card, { width: computedWidth }]}>
                    <Title style={commonStyles.title}>Create account</Title>

                    <View style={{ width: "100%" }}>
                        <TextInput label="Full name" mode="outlined" value={name} onChangeText={setName} style={commonStyles.input} disabled={saving} />
                    </View>

                    <View style={{ width: "100%" }}>
                        <TextInput label="Email" mode="outlined" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={commonStyles.input} disabled={saving} />
                    </View>

                    <View style={{ width: "100%" }}>
                        <TextInput label="Password" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={commonStyles.input} disabled={saving} />
                    </View>

                    <View style={commonStyles.buttonContainer}>
                        <View style={commonStyles.buttonWrapper}>
                            <Button mode="contained" onPress={onSubmit} loading={saving} disabled={saving}>
                                Register
                            </Button>
                        </View>

                        <View style={commonStyles.buttonWrapper}>
                            <Button mode="outlined" onPress={() => navigation.navigate("Login")} disabled={saving}>
                                Have an account? Sign in
                            </Button>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;