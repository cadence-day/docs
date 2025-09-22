import { COLORS } from "@/shared/constants/COLORS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ToastType } from "@/shared/types/toast.types";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  dismissible?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onHide,
  duration = 4000,
  dismissible = true,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const hideToast = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop any running animations
    if (animationRef.current) {
      animationRef.current.stop();
    }

    animationRef.current = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    animationRef.current.start((finished) => {
      if (finished) {
        onHide();
      }
      animationRef.current = null;
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (isVisible) {
      // Reset values when showing
      translateY.setValue(100);
      opacity.setValue(0);

      // Animate in with spring effect
      animationRef.current = Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start();

      // Auto hide after duration if duration > 0
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [isVisible, duration, hideToast, translateY, opacity]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        animationRef.current.stop();
      }
      // Reset animated values to prevent memory leaks
      translateY.setValue(100);
      opacity.setValue(0);
    };
  }, [translateY, opacity]);

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10B981"; // Keep icon colors vibrant
      case "error":
        return COLORS.error;
      case "warning":
        return "#F59E0B";
      case "info":
        return COLORS.primary;
      default:
        return COLORS.primary;
    }
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      case "info":
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  const handleDismiss = () => {
    if (dismissible) {
      hideToast();
    }
  };

  if (!isVisible) return null;

  const iconColor = getIconColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIconName()} size={24} color={iconColor} />
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
          </View>

          {(dismissible || duration === 0) && (
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.dismissButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 20,
    left: 0,
    right: 0,
    zIndex: 9999,
    width: screenWidth,
  },
  gradientContainer: {
    borderRadius: 0,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 64,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flex: 1,
    marginRight: 12,
  },
  message: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  dismissButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Toast;
