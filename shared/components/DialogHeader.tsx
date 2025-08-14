import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DialogHeaderProps {
  title: string | React.ReactNode;
  backAction?: boolean;
  onBackAction?: () => void;
  titleButtonComponent?: React.ReactNode;
  rightActionElement?: string | React.ReactNode;
  onRightAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  headerAsButton?: boolean;
  onHeaderPress?: () => void;
  bottomBorder?: boolean;
  titleFontSize?: number;
  rightActionFontSize?: number;
  isRightActionButton?: boolean;
  onTitleDoubleTap?: () => void; // New prop for double tap on title
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  backAction = false,
  onBackAction,
  titleButtonComponent,
  rightActionElement,
  onRightAction,
  isRightActionButton = true,
  style,
  titleStyle,
  headerAsButton,
  onHeaderPress,
  bottomBorder = true,
  titleFontSize = 20,
  rightActionFontSize = 18,
  onTitleDoubleTap,
}) => {
  const lastTap = React.useRef<number | null>(null);

  const handleTitlePress = React.useCallback(() => {
    if (!onTitleDoubleTap) return;

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      onTitleDoubleTap();
      lastTap.current = null;
    } else {
      // Single tap
      lastTap.current = now;
    }
  }, [onTitleDoubleTap]);
  return (
    <>
      <View style={[styles.container, style]}>
        <View style={styles.left}>
          {backAction && (
            <TouchableOpacity
              onPress={onBackAction}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {typeof title === "string" ? (
            <TouchableWithoutFeedback onPress={handleTitlePress}>
              <View>
                <Text
                  style={[
                    styles.title,
                    titleStyle,
                    { fontSize: titleFontSize },
                  ]}>
                  {title}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ) : (
            title
          )}
          {titleButtonComponent && (
            <View style={styles.titleButton}>{titleButtonComponent}</View>
          )}
        </View>
        <TouchableOpacity
          style={styles.center}
          activeOpacity={0.7}
          onPress={onHeaderPress}
          disabled={!headerAsButton}></TouchableOpacity>
        <View style={styles.right}>
          {rightActionElement &&
            isRightActionButton &&
            (typeof rightActionElement === "string" ? (
              <TouchableOpacity
                onPress={onRightAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text
                  style={[
                    styles.rightActionText,
                    {
                      fontSize: rightActionFontSize,
                      textDecorationLine: "underline",
                    },
                  ]}>
                  {rightActionElement}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onRightAction}
                disabled={!onRightAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {rightActionElement}
              </TouchableOpacity>
            ))}
          {rightActionElement && !isRightActionButton && (
            <View>
              <Text
                style={[
                  styles.rightActionText,
                  {
                    fontSize: rightActionFontSize,
                  },
                ]}>
                {rightActionElement}
              </Text>
            </View>
          )}
        </View>
      </View>
      {bottomBorder && <View style={styles.bottomBorder} />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "transparent",
    minHeight: 50,
    width: "90%",
    alignSelf: "center",
  },
  left: {
    minWidth: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 2, // Increased from 1 to give more space to title
  },
  backButton: {
    paddingRight: 8,
  },
  center: {
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 40,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    textAlign: "left",
    flexShrink: 1,
  },
  titleButton: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  right: {
    minWidth: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightActionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
  },
  bottomBorder: {
    width: "90%",
    alignSelf: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 20,
  },
});

export type { DialogHeaderProps };
export default DialogHeader;
