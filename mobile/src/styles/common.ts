// shared styles
import { StyleSheet, Platform, ViewStyle } from "react-native";

export const CARD_MAX_WIDTH = 400;
export const CARD_MAX_HEIGHT = 600;
export const ACTION_BUTTON_WIDTH = "60%";

const webShadow = ({ boxShadow: "0 6px 18px rgba(0,0,0,0.08)" } as unknown) as ViewStyle;

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: Platform.OS === "web" ? "#f6f7f9" : undefined,
    },

    // ScrollView content: use flexGrow to allow proper centering & avoid forcing minHeight constraints
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },

    // Card: no fixed height, only a maxHeight (600px). width is responsive: full width up to CARD_MAX_WIDTH
    card: {
        width: "100%",
        maxWidth: CARD_MAX_WIDTH,
        maxHeight: CARD_MAX_HEIGHT,
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 8,
        alignSelf: "center",

        ...Platform.select({
            web: webShadow,
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),

        // allow inner content to scroll if it exceeds maxHeight
        overflow: "hidden",
    },

    title: {
        textAlign: "center",
        marginBottom: 12,
    },

    // Make inputs occupy available width and allow shrinking on web
    input: {
        marginBottom: 12,
        width: "100%",
        minWidth: 0, // important on web for shrink behavior
    },

    buttonContainer: {
        marginTop: 12,
        alignItems: "center",
    },

    buttonWrapper: {
        width: ACTION_BUTTON_WIDTH,
        alignSelf: "center",
        marginBottom: 10,
    },

    headerShadow: {
        ...Platform.select({
            web: webShadow,
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    menuRight: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },

    menuIndicator: {
        marginRight: 8,
    },
});

export default styles;