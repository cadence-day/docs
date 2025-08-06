import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
// DISABLED FOR NEXT BUILD - SENTRY INTEGRATION
// import * as Sentry from "@sentry/react-native";
import { supabase } from "@/shared/utils/supabase";
import { AuthResponse, AuthUser } from "../utils/types";
import { ensureProfileWithFullName } from "../utils/profileHelpers";

export const signInWithApple = async (): Promise<AuthResponse<AuthUser>> => {
    try {
        // Sentry.addBreadcrumb({
        //     message: "Starting Apple Sign In process",
        //     category: "auth",
        //     level: "info",
        // });

        // Check if we're in Expo Go
        const isExpoGo = Constants.appOwnership === "expo";
        // Sentry.addBreadcrumb({
        //     message: "Environment check completed",
        //     category: "auth",
        //     level: "info",
        //     data: {
        //         isExpoGo,
        //         appOwnership: Constants.appOwnership,
        //         executionEnvironment: Constants.executionEnvironment,
        //     },
        // });

        if (isExpoGo) {
            // Sentry.addBreadcrumb({
            //     message: "Running in Expo Go - Apple Sign In not supported",
            //     category: "auth",
            //     level: "warning",
            // });
            return {
                success: false,
                error:
                    "Apple Sign In doesn't work in Expo Go. Please use email/password login or build a development build to test Apple Sign In.",
            };
        }

        // Check if Apple Authentication is available
        if (Platform.OS !== "ios") {
            // Sentry.addBreadcrumb({
            //     message: "Not on iOS platform",
            //     category: "auth",
            //     level: "warning",
            //     data: { platform: Platform.OS },
            // });
            return {
                success: false,
                error: "Apple Sign In is only available on iOS",
            };
        }

        // Sentry.addBreadcrumb({
        //     message: "Checking if Apple Authentication is available",
        //     category: "auth",
        //     level: "info",
        // });

        const isAvailable = await AppleAuthentication.isAvailableAsync();
        // Sentry.addBreadcrumb({
        //     message: "Apple Authentication availability checked",
        //     category: "auth",
        //     level: "info",
        //     data: { available: isAvailable },
        // });

        if (!isAvailable) {
            // Sentry.addBreadcrumb({
            //     message: "Apple Sign In not available on this device",
            //     category: "auth",
            //     level: "warning",
            // });
            return {
                success: false,
                error: "Apple Sign In is not available on this device",
            };
        }

        // Sentry.addBreadcrumb({
        //     message:
        //         "Requesting Apple credentials with scopes: FULL_NAME, EMAIL",
        //     category: "auth",
        //     level: "info",
        // });

        // Add timeout to prevent hanging in Expo Go or other issues
        const APPLE_SIGNIN_TIMEOUT = 30000; // 30 seconds

        const appleSignInPromise = AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        "Apple Sign In timed out after 30 seconds. This often happens in Expo Go or when Apple servers are slow.",
                    ),
                );
            }, APPLE_SIGNIN_TIMEOUT);
        });

        // Sentry.addBreadcrumb({
        //     message: "Waiting for Apple authentication (30s timeout)",
        //     category: "auth",
        //     level: "info",
        // });

        // Race between Apple sign in and timeout
        const credential = (await Promise.race([
            appleSignInPromise,
            timeoutPromise,
        ])) as AppleAuthentication.AppleAuthenticationCredential;

        // Sentry.addBreadcrumb({
        //     message: "Apple credential received",
        //     category: "auth",
        //     level: "info",
        //     data: {
        //         user: credential.user,
        //         email: credential.email,
        //         hasFullName: !!credential.fullName,
        //         authorizationCode: credential.authorizationCode
        //             ? "present"
        //             : "missing",
        //         identityToken: credential.identityToken ? "present" : "missing",
        //         realUserStatus: credential.realUserStatus,
        //         state: credential.state,
        //     },
        // });

        if (!credential.identityToken) {
            // Sentry.captureMessage("No identity token received from Apple", {
            //     level: "error",
            //     tags: {
            //         component: "apple-auth",
            //         action: "signInWithApple",
            //     },
            //     extra: { credential },
            // });
            return {
                success: false,
                error: "No identity token received from Apple",
            };
        }

        // Sentry.addBreadcrumb({
        // message:
        //         "Identity token received, attempting Supabase authentication",
        //     category: "auth",
        //     level: "info",
        //     data: { tokenLength: credential.identityToken.length },
        // });

        // Sign in with Supabase using the Apple ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: credential.identityToken,
        });

        // Sentry.addBreadcrumb({
        //     message: "Supabase response received",
        //     category: "auth",
        //     level: "info",
        //     data: {
        //         hasData: !!data,
        //         hasUser: !!data?.user,
        //         hasSession: !!data?.session,
        //         hasError: !!error,
        //     },
        // });

        if (error) {
            // Sentry.captureMessage("Supabase authentication error", {
            //     level: "error",
            //     tags: {
            //         component: "apple-auth",
            //         action: "supabaseSignIn",
            //     },
            //     extra: {
            //         error: error.message,
            //         status: error.status,
            //         name: error.name,
            //     },
            // });

            // Handle specific Supabase Apple provider errors
            if (
                error.message.includes("Provider") &&
                error.message.includes("not enabled")
            ) {
                // Sentry.addBreadcrumb({
                //     message: "Provider not enabled error detected",
                //     category: "auth",
                //     level: "warning",
                // });
                return {
                    success: false,
                    error:
                        "Apple Sign In is not configured on the server. Please contact support or use email/password login.",
                };
            }

            // Handle Expo Go audience error
            if (
                error.message.includes("Unacceptable audience") &&
                error.message.includes("host.exp.Exponent")
            ) {
                // Sentry.addBreadcrumb({
                //     message: "Expo Go audience error detected",
                //     category: "auth",
                //     level: "warning",
                // });
                return {
                    success: false,
                    error:
                        "Apple Sign In doesn't work in Expo Go. Please use email/password login or build a development build to test Apple Sign In.",
                };
            }

            return { success: false, error: error.message };
        }

        if (data.session && data.user) {
            // Sentry.addBreadcrumb({
            //     message: "Supabase authentication successful",
            //     category: "auth",
            //     level: "info",
            //     data: {
            //         userId: data.user.id,
            //         userEmail: data.user.email,
            //         hasMetadata: !!data.user.user_metadata,
            //         hasAppMetadata: !!data.user.app_metadata,
            //     },
            // });

            // Prepare full name from Apple credential if available
            let fullName = data.user.user_metadata?.full_name ||
                data.user.email || "";

            if (credential.fullName) {
                // Sentry.addBreadcrumb({
                //     message: "Using Apple credential full name",
                //     category: "auth",
                //     level: "info",
                //     data: {
                //         givenName: credential.fullName.givenName,
                //         familyName: credential.fullName.familyName,
                //     },
                // });

                const { givenName, familyName } = credential.fullName;
                if (givenName || familyName) {
                    fullName = [givenName, familyName].filter(Boolean).join(
                        " ",
                    );

                    // Ensure profile is created/updated with full name from Apple
                    try {
                        await ensureProfileWithFullName(
                            data.user.id,
                            fullName,
                            data.user.email || "",
                        );
                    } catch (updateError) {
                        console.warn(
                            "Failed to ensure profile with full name:",
                            updateError,
                        );
                        // Don't fail the sign in if profile update fails
                    }
                }
            }

            // Sentry.addBreadcrumb({
            //     message: "Final user name determined",
            //     category: "auth",
            //     level: "info",
            //     data: { finalUserName: fullName },
            // });

            const user: AuthUser = {
                id: data.user.id,
                name: fullName,
                email: data.user.email || "",
                avatar_url: data.user.user_metadata?.avatar_url,
                created_at: data.user.created_at,
                last_sign_in_at: data.user.last_sign_in_at,
            };

            // Sentry.addBreadcrumb({
            //     message: "Returning successful auth response",
            //     category: "auth",
            //     level: "info",
            // });
            return { success: true, data: user };
        }

        // Sentry.captureMessage(
        //     "No session or user data received from Supabase",
        //     {
        //         level: "error",
        //         tags: {
        //             component: "apple-auth",
        //             action: "signInWithApple",
        //         },
        //     },
        // );
        return { success: false, error: "Apple Sign In failed" };
    } catch (error: any) {
        // Sentry.captureException(error, {
        //     tags: {
        //         component: "apple-auth",
        //         action: "signInWithApple",
        //     },
        //     extra: {
        //         errorMessage: error.message,
        //         errorCode: error.code,
        //         errorName: error.name,
        //     },
        // });

        // Handle user cancellation gracefully (don't show as error)
        if (
            error.code === "ERR_REQUEST_CANCELED" ||
            error.code === "ERR_CANCELED" ||
            error.message?.includes("canceled") ||
            error.message?.includes("cancelled")
        ) {
            // Sentry.addBreadcrumb({
            //     message: "User canceled the Apple Sign In process",
            //     category: "auth",
            //     level: "info",
            // });
            return { success: false, error: "CANCELED" }; // Special code for cancellation
        }

        // Handle timeout
        if (error.message?.includes("timed out")) {
            // Sentry.addBreadcrumb({
            //     message: "Apple Sign In timed out",
            //     category: "auth",
            //     level: "warning",
            // });
            return {
                success: false,
                error:
                    "Apple Sign In timed out. This often happens in Expo Go. Please try email/password login or use a development build.",
            };
        }

        // Handle Expo Go specific errors
        if (
            error.message?.includes("Expo Go") ||
            error.message?.includes("host.exp.Exponent")
        ) {
            // Sentry.addBreadcrumb({
            //     message: "Expo Go compatibility error detected",
            //     category: "auth",
            //     level: "warning",
            // });
            return {
                success: false,
                error:
                    "Apple Sign In doesn't work in Expo Go. Please use email/password login or build a development build.",
            };
        }

        // Sentry.addBreadcrumb({
        //     message: "Returning error response from Apple Sign In",
        //     category: "auth",
        //     level: "error",
        //     data: { errorMessage: error.message || "Apple Sign In failed" },
        // });

        return {
            success: false,
            error: error.message || "Apple Sign In failed",
        };
    }
};
