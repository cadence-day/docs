import { COLORS } from "@/shared/constants/COLORS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
  title: string; // Required title
  body: string; // Required body
  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  dismissible?: boolean;
  // Navigation options
  href?: string; // Expo Router path to navigate to on tap
  onPress?: () => void; // Custom action on tap
}

const { width: screenWidth } = Dimensions.get("window");

const Toast: React.FC<ToastProps> = ({
  title,
  body,
  type,
  isVisible,
  onHide,
  duration = 4000,
  dismissible = true,
  href,
  onPress,
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

  const handleDismiss = () => {
    if (dismissible) {
      hideToast();
    }
  };

  const handleToastPress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href);
    }
    // Optionally dismiss toast after navigation
    if (href || onPress) {
      hideToast();
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case "success":
        return {
          name: "checkmark-circle" as const,
          color: COLORS.quinary, // Sage green
        };
      case "error":
        return {
          name: "close-circle" as const,
          color: COLORS.error, // Red
        };
      case "warning":
        return {
          name: "warning" as const,
          color: COLORS.tertiary, // Coral red
        };
      case "info":
      default:
        return {
          name: "information-circle" as const,
          color: COLORS.primary, // Steel blue
        };
    }
  };

  const iconConfig = getIconConfig();

  if (!isVisible) return null;

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
            <Ionicons
              name={iconConfig.name}
              size={24}
              color={iconConfig.color}
            />
          </View>

          <TouchableOpacity
            style={styles.textContainer}
            onPress={handleToastPress}
            disabled={!href && !onPress}
            activeOpacity={href || onPress ? 0.7 : 1}
          >
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>
          </TouchableOpacity>

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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 64,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2, // Slight adjustment to align with title
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 4,
  },
  body: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    opacity: 0.9,
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
