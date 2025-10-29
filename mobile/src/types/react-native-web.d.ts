import "react-native";

declare module "react-native" {
    // Extend the style interfaces to accept CSS boxShadow on web builds
    interface ViewStyle {
        boxShadow?: string;
    }
    interface TextStyle {
        boxShadow?: string;
    }
    interface ImageStyle {
        boxShadow?: string;
    }
}