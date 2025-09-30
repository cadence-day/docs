import { COLORS } from "@/shared/constants/COLORS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { sharedComponentStyles } from "./styles";

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
  const resolvedTitle = title ?? "";
  const resolvedBody = body ?? message ?? "";
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

  return (
    <Animated.View
      style={[
        sharedComponentStyles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
        },
        { bottom: NavBarSize },
      ]}
    >
      <LinearGradient
        colors={[COLORS.linearGradient.start, COLORS.linearGradient.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={sharedComponentStyles.toastGradientContainer}
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

export default Toast;
