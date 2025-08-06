import { StyleSheet } from "react-native";

const authDialogStyles = StyleSheet.create({
    content: {
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    form: {
        width: "100%",
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        color: "#ffffff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#EF4444",
        borderRadius: 8,
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        marginLeft: 8,
        flex: 1,
    },
    // Button styles
    primaryButton: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        marginVertical: 16,
    },
    primaryButtonDisabled: {
        backgroundColor: "#666666",
        opacity: 0.6,
    },
    primaryButtonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "600",
    },
    primaryButtonTextDisabled: {
        color: "#CCCCCC",
    },
    secondaryButton: {
        backgroundColor: "#666666",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 16,
    },
    secondaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    // Link styles
    linkContainer: {
        alignItems: "center",
        marginTop: 24,
    },
    linkText: {
        fontSize: 14,
        color: "#ffffff",
        textDecorationLine: "underline",
    },
    // Apple Sign In
    appleSignInButton: {
        width: "100%",
        height: 44,
        marginTop: 16,
        borderRadius: 8,
        overflow: "hidden",
    },
    // Loading states
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    // Forgot password and other small links
    forgotPassword: {
        alignItems: "flex-start",
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 12,
        color: "#fff",
        textDecorationLine: "underline",
    },
    // Magic link button
    magicLinkButton: {
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        justifyContent: "center",
        alignContent: "center",
        paddingVertical: 8,
        borderRadius: 8,
    },
    magicLinkText: {
        fontSize: 14,
        color: "#fff",
        width: "100%",
        textAlign: "center",
    },
    // Switch between auth modes
    switchContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    switchText: {
        fontSize: 12,
        color: "#fff",
    },
    // Success states
    successContainer: {
        alignItems: "center",
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    successMessage: {
        fontSize: 16,
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 8,
    },
    emailText: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
        marginBottom: 24,
    },
    instructionText: {
        fontSize: 14,
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 32,
    },
    // Delete dialog specific styles
    iconContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    warningBox: {
        flexDirection: "row",
        borderColor: "#DC2626",
        borderWidth: 1,
        padding: 16,
        marginBottom: 32,
        alignItems: "flex-start",
        borderRadius: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: "#DC2626",
        marginLeft: 12,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#EF4444",
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default authDialogStyles;
