import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import SageIcon from "@/shared/components/icons/SageIcon";
import NotificationPanel from "@/shared/components/NotificationPanel";
import { COLORS } from "@/shared/constants/COLORS";
import { useNotifications } from "@/shared/notifications";

interface NotificationSageIconProps {
  size?: number;
  onSagePress?: () => void;
  showFallbackMessage?: boolean;
  fallbackMessage?: string;
}

const NotificationSageIcon: React.FC<NotificationSageIconProps> = ({
  size = 40,
  onSagePress,
  showFallbackMessage = true,
  fallbackMessage = "Cadence AI is currently not available.",
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const { unreadCount } = useNotifications();

  const hasNotifications = unreadCount > 0;

  const handlePress = () => {
    if (hasNotifications) {
      setIsPanelVisible(true);
    } else if (onSagePress) {
      onSagePress();
    } else if (showFallbackMessage) {
      // Show default sage unavailable message
      // Using alert for now, but this could be a toast
      alert(fallbackMessage);
    }
  };

  const handleClosePanel = () => {
    setIsPanelVisible(false);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <View style={styles.iconContainer}>
          <SageIcon
            size={size}
            status={hasNotifications ? "pulsating" : "still"}
            auto={false}
          />
          {hasNotifications && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount.toString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <NotificationPanel
        isVisible={isPanelVisible}
        onClose={handleClosePanel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  iconContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationSageIcon;
