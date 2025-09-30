import { COLORS } from "@/shared/constants/COLORS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router, useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ToastType } from "@/shared/types/toast.types";
import { useNavBarSize } from "../constants/VIEWPORT";

interface ToastProps {
  // Backwards compatible: some callers provide a single `message` string
  message?: string;

  // Preferred shape: explicit title and body
  title?: string;
  body?: string;

  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  dismissible?: boolean;
  // Navigation options
  href?: string; // Expo Router path to navigate to on tap
  onPress?: () => void; // Custom action on tap
}

// Dimensions not required for current placement logic; keep import for future use.

const Toast: React.FC<ToastProps> = ({
  // Accept either `message` or `title`/`body`. Prefer explicit title/body.
  message,
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
  // Resolve display values: if explicit title/body are missing, use `message` as the body.
  const NavBarSize = useNavBarSize();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // Determine if the current route is inside the bottom-tabbed (home) layout.
  // Our tab group lives under the (home) route group, so presence of that
  // segment indicates bottom tabs are visible.
  const hasBottomTabs = Boolean(
    segments && segments.length > 0 && segments[0] === "(home)"
  );
  const resolvedTitle = title ?? "";
  const resolvedBody = body ?? message ?? "";
  // Start off-screen. For bottom placement we'll animate from +100 -> 0,
  // for top placement we'll animate from -100 -> 0.
  const translateY = useRef(
    new Animated.Value(hasBottomTabs ? 100 : -100)
  ).current;
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
        toValue: hasBottomTabs ? 100 : -100,
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
  }, [translateY, opacity, onHide, hasBottomTabs]);

  useEffect(() => {
    if (isVisible) {
      // Reset values when showing. Use placement-aware start positions so
      // the animation slides in from the appropriate direction.
      translateY.setValue(hasBottomTabs ? 100 : -100);
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
  }, [isVisible, duration, hideToast, translateY, opacity, hasBottomTabs]);

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
      translateY.setValue(hasBottomTabs ? 100 : -100);
      opacity.setValue(0);
    };
  }, [translateY, opacity, hasBottomTabs]);

  const handleDismiss = () => {
    if (dismissible) {
      hideToast();
    }
  };

  const handleToastPress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as RelativePathString);
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

  // Compute placement styles: when bottom tabs exist we anchor to bottom
  // (full width). Otherwise anchor to the top with inset spacing and rounded
  // corners.
  const placementStyle: ViewStyle = hasBottomTabs
    ? {
        left: 0,
        right: 0,
        bottom: NavBarSize,
      }
    : {
        left: 16,
        right: 16,
        top: Math.max(8, insets.top + 8),
      };

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        { transform: [{ translateY }], opacity },
        placementStyle,
      ]}
    >
      <LinearGradient
        colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={
          hasBottomTabs
            ? styles.gradientContainer
            : [styles.gradientContainer, styles.topGradientContainer]
        }
      >
        <View style={sharedComponentStyles.toastContent}>
          <View style={sharedComponentStyles.toastIconContainer}>
            <Ionicons
              name={iconConfig.name}
              size={24}
              color={iconConfig.color}
            />
          </View>

          <TouchableOpacity
            style={sharedComponentStyles.toastTextContainer}
            onPress={handleToastPress}
            disabled={!href && !onPress}
            activeOpacity={href || onPress ? 0.7 : 1}
          >
            <Text style={sharedComponentStyles.toastTitle} numberOfLines={1}>
              {resolvedTitle}
            </Text>
            <Text style={sharedComponentStyles.toastBody} numberOfLines={2}>
              {resolvedBody}
            </Text>
          </TouchableOpacity>

          {(dismissible || duration === 0) && (
            <TouchableOpacity
              onPress={handleDismiss}
              style={sharedComponentStyles.toastDismissButton}
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
  animatedContainer: {
    position: "absolute",
    zIndex: 9999,
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
  topGradientContainer: {
    borderRadius: 12,
    marginHorizontal: 0,
    // higher elevation for top toast
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
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
