import { useI18n } from "@/shared/hooks/useI18n";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ACTIVITY_THEME, WEIGHT_CONFIG } from "../../../constants";
import { getWeightDescription } from "../../../utils";

interface CustomSliderProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  leftLabel: string;
  rightLabel: string;
}

export const CustomSlider = React.memo<CustomSliderProps>(
  ({ value, onValueChange, disabled = false, leftLabel, rightLabel }) => {
    const { t } = useI18n();
    const sliderContainerRef = useRef<View>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [sliderLayout, setSliderLayout] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    const handleSliderTouch = useCallback(
      (locationX: number) => {
        if (disabled || sliderLayout.width === 0) return;

        const clampedX = Math.max(0, Math.min(sliderLayout.width, locationX));
        const percentage = clampedX / sliderLayout.width;
        const newValue = Math.round(percentage * WEIGHT_CONFIG.SLIDER_STEPS);

        const currentValue = parseInt(value);
        if (newValue !== currentValue) {
          onValueChange(String(newValue));
        }
      },
      [disabled, sliderLayout.width, value, onValueChange]
    );

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
          setIsDragging(true);
          handleSliderTouch(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => {
          handleSliderTouch(evt.nativeEvent.locationX);
        },
        onPanResponderRelease: () => {
          setIsDragging(false);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      })
    ).current;

    // Memoize weight description
    const weightDescription = useMemo(
      () => getWeightDescription(parseInt(value) || WEIGHT_CONFIG.DEFAULT),
      [value]
    );

    const sliderPercentage = useMemo(
      () => (parseInt(value) / WEIGHT_CONFIG.SLIDER_STEPS) * 100,
      [value]
    );

    return (
      <View style={styles.container}>
        {/* Labels */}
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>{t(leftLabel)}</Text>
          <Text style={styles.label}>{t(rightLabel)}</Text>
        </View>

        {/* Slider */}
        <TouchableWithoutFeedback
          onPress={(evt) => {
            if (disabled || sliderLayout.width === 0) return;
            handleSliderTouch(evt.nativeEvent.locationX);
          }}
        >
          <View
            ref={sliderContainerRef}
            style={styles.sliderContainer}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setSliderLayout({ x, y, width, height });
            }}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack}>
              <View
                style={[styles.sliderFill, { width: `${sliderPercentage}%` }]}
              />
            </View>
            <View style={styles.sliderThumbContainer}>
              <View
                style={[styles.sliderThumb, { left: `${sliderPercentage}%` }]}
              >
                <View
                  style={[
                    styles.sliderThumbInner,
                    isDragging && styles.sliderThumbDragging,
                  ]}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <Text style={styles.weightDescription}>{t(weightDescription)}</Text>
      </View>
    );
  }
);

CustomSlider.displayName = "CustomSlider";

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    color: ACTIVITY_THEME.GRAY_LIGHT,
    fontWeight: "500",
  },
  sliderContainer: {
    position: "relative",
    height: 40,
    marginVertical: 8,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: ACTIVITY_THEME.SLIDER_TRACK,
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: ACTIVITY_THEME.SLIDER_FILL,
    borderRadius: 2,
  },
  sliderThumbContainer: {
    position: "absolute",
    width: "100%",
    height: 40,
    justifyContent: "center",
    pointerEvents: "none",
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    marginLeft: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderThumbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACTIVITY_THEME.SLIDER_THUMB_BG,
    borderWidth: 3,
    borderColor: ACTIVITY_THEME.WHITE,
    ...getShadowStyle(ShadowLevel.Medium),
  },
  sliderThumbDragging: {
    transform: [{ scale: 1.2 }],
    backgroundColor: ACTIVITY_THEME.SLIDER_THUMB_ACTIVE,
  },
  weightDescription: {
    fontSize: 12,
    color: ACTIVITY_THEME.WHITE,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});
