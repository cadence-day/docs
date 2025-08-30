import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect } from "react-native-svg";

interface NoInternetScreenProps {
  onRetry?: () => Promise<void>;
}

const NoInternetFallback: React.FC<NoInternetScreenProps> = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
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
              stroke="#66646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="49.5635"
              y="10.0977"
              width="12.7166"
              height="45.6694"
              rx="1.5"
              stroke="#66646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="66.4053"
              y="0.5"
              width="12.9164"
              height="55.5667"
              rx="1.5"
              stroke="#66646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="16.6104"
              y="32.0664"
              width="11.9843"
              height="23.7008"
              rx="1.5"
              stroke="#66646EC"
              strokeWidth="2"
              fill="none"
            />
            <Rect
              x="0.5"
              y="41.5859"
              width="11.9843"
              height="14.9134"
              rx="1.5"
              stroke="#66646EC"
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

        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              isRetrying && styles.retryButtonDisabled,
            ]}
            onPress={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <View style={styles.retryButtonContent}>
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={styles.loadingIcon}
                />
                <Text style={styles.retryButtonText}>Checking...</Text>
              </View>
            ) : (
              <Text style={styles.retryButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#666",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
});

export default NoInternetFallback;
