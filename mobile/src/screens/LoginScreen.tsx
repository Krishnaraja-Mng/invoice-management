import React, { useContext, useState } from "react";
import {
    View,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import commonStyles, { CARD_MAX_WIDTH, CARD_MAX_HEIGHT } from "../styles/common";

/**
 * Key changes:
 * - KeyboardAvoidingView uses style={{ flex: 1 }} so it doesn't constrain width.
 * - ScrollView uses contentContainerStyle with flexGrow: 1 so centering works.
 * - Card no longer has a fixed height; it uses maxHeight (600). If content exceeds it, inner scroll can handle it.
 * - Provide keyboardVerticalOffset to avoid aggressive shifting on iOS.
 */
const LoginScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { signIn } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const window = useWindowDimensions();
    // Optional: calculate a safe width (subtract some padding if you want)
    const horizontalPadding = 32; // same as outer padding * 2 roughly
    const computedWidth = Math.min(window.width - horizontalPadding, CARD_MAX_WIDTH);

    const onSubmit = async () => {
        if (!email || !password) return;
        setSaving(true);
        const result = await signIn(email.trim(), password);
        setSaving(false);
        if (!result.ok) {
            // show error (omitted here)
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }} // important: allow KAV to manage vertical offset without constraining width
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView contentContainerStyle={commonStyles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* apply computed width to card; fallback to commonStyles.card which uses width: '100%' and maxWidth */}
                <View style={[commonStyles.card, { width: computedWidth }]}>
                    <Title style={commonStyles.title}>Sign in</Title>

                    <View style={{ width: "100%" }}>
                        <TextInput
                            label="Email"
                            mode="outlined"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            style={commonStyles.input}
                            disabled={saving}
                        />
                    </View>

                    <View style={{ width: "100%" }}>
                        <TextInput
                            label="Password"
                            mode="outlined"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            style={commonStyles.input}
                            disabled={saving}
                        />
                    </View>

                    <View style={commonStyles.buttonContainer}>
                        <View style={commonStyles.buttonWrapper}>
                            <Button mode="contained" onPress={onSubmit} loading={saving} disabled={saving} uppercase={false}>
                                Sign in
                            </Button>
                        </View>

                        <View style={commonStyles.buttonWrapper}>
                            <Button mode="outlined" onPress={() => navigation.navigate("Register")} disabled={saving} uppercase={false}>
                                Create account
                            </Button>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;