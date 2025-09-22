import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/shared/constants/COLORS";
import { useNotifications } from "@/shared/notifications";
import type { InAppNotificationDisplay } from "@/shared/notifications/providers/InAppNotificationProvider";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";

interface NotificationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isVisible,
  onClose,
}) => {
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const {
    inAppNotifications,
    markAsRead,
    markAllAsRead,
    clearNotificationHistory,
  } = useNotifications();

  useEffect(() => {
    if (isVisible) {
      // Slide in from right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to right
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get("window").width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearNotificationHistory();
  };

  const handleNotificationPress = (notification: InAppNotificationDisplay) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return "trophy-outline";
      case "reminder":
      case "streak-reminder":
        return "alarm-outline";
      case "midday-reflection":
      case "evening-reflection":
        return "sunny-outline";
      case "system":
        return "information-circle-outline";
      case "test":
        return "flask-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "#10B981"; // green
      case "reminder":
      case "streak-reminder":
        return "#F59E0B"; // amber
      case "midday-reflection":
      case "evening-reflection":
        return COLORS.primary;
      case "system":
        return "#6B7280"; // gray
      case "test":
        return "#8B5CF6"; // purple
      default:
        return COLORS.primary;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={100} style={styles.blurContainer}>
            <View style={styles.panelContent}>
              <PanelHeader
                onClose={onClose}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
                notificationCount={inAppNotifications.length}
                unreadCount={inAppNotifications.filter((n) => !n.isRead).length}
              />
              <NotificationList
                notifications={inAppNotifications}
                onNotificationPress={handleNotificationPress}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                formatTimestamp={formatTimestamp}
              />
            </View>
          </BlurView>
        ) : (
          <View style={[styles.blurContainer, styles.androidBackground]}>
            <View style={styles.panelContent}>
              <PanelHeader
                onClose={onClose}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
                notificationCount={inAppNotifications.length}
                unreadCount={inAppNotifications.filter((n) => !n.isRead).length}
              />
              <NotificationList
                notifications={inAppNotifications}
                onNotificationPress={handleNotificationPress}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                formatTimestamp={formatTimestamp}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </>
  );
};

interface PanelHeaderProps {
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  notificationCount: number;
  unreadCount: number;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  onClose,
  onMarkAllAsRead,
  onClearAll,
  notificationCount,
  unreadCount,
}) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={COLORS.text.header} />
      </TouchableOpacity>
    </View>

    <View style={styles.headerStats}>
      <Text style={styles.statsText}>
        {notificationCount} total, {unreadCount} unread
      </Text>
    </View>

    {notificationCount > 0 && (
      <View style={styles.headerActions}>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={onMarkAllAsRead}
            style={styles.actionButton}
          >
            <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onClearAll} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
            Clear all
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

interface NotificationListProps {
  notifications: InAppNotificationDisplay[];
  onNotificationPress: (notification: InAppNotificationDisplay) => void;
  getNotificationIcon: (type: string) => keyof typeof Ionicons.glyphMap;
  getNotificationColor: (type: string) => string;
  formatTimestamp: (date: Date) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationPress,
  getNotificationIcon,
  getNotificationColor,
  formatTimestamp,
}) => (
  <ScrollView
    style={styles.notificationList}
    showsVerticalScrollIndicator={false}
  >
    {notifications.length === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons
          name="notifications-outline"
          size={48}
          color={COLORS.text.subheader}
        />
        <Text style={styles.emptyStateTitle}>No notifications</Text>
        <Text style={styles.emptyStateText}>
          When you receive in-app notifications, they'll appear here.
        </Text>
      </View>
    ) : (
      notifications.map((notification) => (
        <TouchableOpacity
          key={notification.id}
          style={[
            styles.notificationItem,
            !notification.isRead && styles.unreadNotification,
          ]}
          onPress={() => onNotificationPress(notification)}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.notificationIcon}>
              <Ionicons
                name={getNotificationIcon(notification.message.type)}
                size={20}
                color={getNotificationColor(notification.message.type)}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text
                style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.unreadTitle,
                ]}
              >
                {notification.message.title}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>
            {!notification.isRead && <View style={styles.unreadIndicator} />}
          </View>
          <Text style={styles.notificationBody}>
            {notification.message.body}
          </Text>
        </TouchableOpacity>
      ))
    )}
  </ScrollView>
);

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9998,
  },
  overlayTouchable: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 400,
    zIndex: 9999,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: "hidden",
  },
  androidBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    ...getShadowStyle(ShadowLevel.High),
  },
  panelContent: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  headerStats: {
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  notificationList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  notificationItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  unreadNotification: {
    backgroundColor: "rgba(102, 70, 236, 0.05)",
    borderColor: "rgba(102, 70, 236, 0.1)",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    paddingLeft: 44, // Align with content after icon
  },
});

export default NotificationPanel;
