import { COLORS } from "@/shared/constants/COLORS";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import { ToastType } from "@/shared/types/toast.types";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onHide,
  duration = 4000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Reset values when showing
      translateY.setValue(-100);
      opacity.setValue(0);

      // Animate in
      animationRef.current = Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start();

      // Auto hide after duration
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
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
  }, [isVisible, duration]);

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
      translateY.setValue(-100);
      opacity.setValue(0);
    };
  }, []);

  const hideToast = () => {
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
        toValue: -100,
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
  };

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return styles.successToast;
      case "error":
        return styles.errorToast;
      case "warning":
        return styles.warningToast;
      case "info":
        return styles.infoToast;
      default:
        return styles.infoToast;
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

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons
        name={getIconName()}
        size={20}
        color={COLORS.white}
        style={styles.icon}
      />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    ...getShadowStyle(ShadowLevel.Medium),
  },
  successToast: {
    backgroundColor: "#10B981",
  },
  errorToast: {
    backgroundColor: COLORS.error,
  },
  warningToast: {
    backgroundColor: "#F59E0B",
  },
  infoToast: {
    backgroundColor: COLORS.primary,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Toast;
