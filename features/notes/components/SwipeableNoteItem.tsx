import * as Haptics from "expo-haptics";
import { Star, StarHalf, Trash } from "phosphor-react-native";
import React, { useRef } from "react";
import { Animated, Dimensions, Text, TextInput, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";

import type { NoteItem } from "../types";

const { width: screenWidth } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 70;

interface SwipeableNoteItemProps {
  note: NoteItem;
  index: number;
  isActive: boolean;
  isPinned?: boolean;
  placeholder: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onDelete: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  textInputRef?: React.RefObject<TextInput | null>;
}

export const SwipeableNoteItem: React.FC<SwipeableNoteItemProps> = ({
  note,
  index,
  isActive,
  isPinned = false,
  placeholder,
  onChangeText,
  onFocus,
  onDelete,
  onPin,
  onUnpin,
  textInputRef,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastGestureX = useRef(0);
  const isSwipeActive = useRef(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { state, translationX, velocityX } = event.nativeEvent;

    if (state === State.BEGAN) {
      isSwipeActive.current = true;
      lastGestureX.current = 0;
    }

    if (state === State.END || state === State.CANCELLED) {
      const shouldTriggerAction =
        Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 1000;

      if (shouldTriggerAction) {
        if (translationX < -SWIPE_THRESHOLD) {
          // Left swipe - Delete action
          handleDelete();
        } else if (translationX > SWIPE_THRESHOLD) {
          // Right swipe - Pin/Unpin action
          handlePinToggle();
        }
      }

      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();

      isSwipeActive.current = false;
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  const handlePinToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPinned) {
      onUnpin?.();
    } else {
      onPin?.();
    }
  };

  const getSwipeProgress = () => {
    return translateX.interpolate({
      inputRange: [-screenWidth, 0, screenWidth],
      outputRange: [-1, 0, 1],
      extrapolate: "clamp",
    });
  };

  const getLeftActionOpacity = () => {
    return translateX.interpolate({
      inputRange: [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: "clamp",
    });
  };

  const getRightActionOpacity = () => {
    return translateX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2],
      outputRange: [0, 0.8, 1],
      extrapolate: "clamp",
    });
  };

  return (
    <View style={styles.container}>
      {/* Left Action (Delete) */}
      <Animated.View
        style={[
          styles.leftAction,
          {
            opacity: getLeftActionOpacity(),
          },
        ]}
      >
        <View style={styles.actionContent}>
          <Trash size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>Delete</Text>
        </View>
      </Animated.View>

      {/* Right Action (Pin/Unpin) */}
      <Animated.View
        style={[
          styles.rightAction,
          {
            opacity: getRightActionOpacity(),
          },
        ]}
      >
        <View style={styles.actionContent}>
          {isPinned ? (
            <>
              <StarHalf size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Unpin</Text>
            </>
          ) : (
            <>
              <Star size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Pin</Text>
            </>
          )}
        </View>
      </Animated.View>

      {/* Main Note Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
        enabled={!isActive} // Disable swipe when editing
      >
        <Animated.View
          style={[
            styles.noteContainer,
            isPinned && styles.pinnedNote,
            isActive && styles.activeNote,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TextInput
            ref={textInputRef}
            style={[styles.noteInput, isActive && styles.noteInputActive]}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            multiline
            scrollEnabled={false}
            value={note.message || ""}
            onChangeText={onChangeText}
            onFocus={onFocus}
            editable={!isSwipeActive.current}
          />

          {isPinned && (
            <View style={styles.pinIndicator}>
              <Star size={16} color="#6366F1" />
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = {
  container: {
    position: "relative" as const,
    marginBottom: 12,
  },
  noteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    minHeight: 60,
    position: "relative" as const,
  },
  pinnedNote: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  activeNote: {
    borderColor: "#6366F1",
    borderWidth: 2,
  },
  noteInput: {
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    paddingRight: 40, // Space for pin indicator
    minHeight: 60,
    textAlignVertical: "top" as const,
  },
  noteInputActive: {
    // Additional styles when focused
  },
  pinIndicator: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  leftAction: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: "#EF4444",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  rightAction: {
    position: "absolute" as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: "#6366F1",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  actionContent: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
    marginTop: 4,
  },
};
