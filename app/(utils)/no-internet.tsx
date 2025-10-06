import { CdButton } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import { useNetwork } from "@/shared/context/NetworkProvider";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { GlobalErrorHandler } from "../../shared/utils/errorHandler";

interface NoInternetScreenProps {
  onRetry?: () => Promise<void>;
}

const NoInternetFallback: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      // First, ask the NetworkProvider to refresh global state (non-blocking).
      if (typeof retry === "function") {
        try {
          retry();
        } catch (e) {
          GlobalErrorHandler.logError(
            "NoInternetFallback",
            "Error calling retry from NetworkProvider",
            e instanceof Error ? e : undefined
          );
        }
      }

      // If a custom onRetry was provided, call it and wait for it to complete.
      if (onRetry) {
        await onRetry();
      }

      // Perform an explicit connectivity check and only navigate when connected.
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        // Replace to root (NetworkProvider will also be in sync). Using replace keeps navigation clean.
        router.replace("/");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const router = useRouter();
  const network = useNetwork();
  const { isConnected, retry } = network;

  // If network becomes online while this screen is mounted, navigate away.
  useEffect(() => {
    if (isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  return (
    <LinearGradient
      colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Svg width="80" height="57" viewBox="0 0 80 57" fill="none">
            <Rect
              x="32.7207"
              y="20.3496"
              width="12.7166"
              height="35.4174"
              rx="1.5"
              stroke="#6646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="49.5635"
              y="10.0977"
              width="12.7166"
              height="45.6694"
              rx="1.5"
              stroke="#6646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="66.4053"
              y="0.5"
              width="12.9164"
              height="55.5667"
              rx="1.5"
              stroke="#6646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="16.6104"
              y="32.0664"
              width="11.9843"
              height="23.7008"
              rx="1.5"
              stroke="#6646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="0.5"
              y="41.5859"
              width="11.9843"
              height="14.9134"
              rx="1.5"
              stroke="#6646EC"
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        </View>

        <Text style={styles.title}>No internet connection</Text>

        <Text style={styles.message}>
          Please check your internet connection and try again. Make sure you're
          connected to Wi-Fi or mobile data.
        </Text>

        {/* Retry Button using shared CdButton */}
        <CdButton
          title={isRetrying ? "Checking..." : "Try Again"}
          onPress={handleRetry}
          disabled={isRetrying}
          variant="outline"
          size="large"
          style={styles.cdButton}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.dark.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  cdButton: {
    marginTop: 8,
    minWidth: 200,
  },
});

export default NoInternetFallback;
