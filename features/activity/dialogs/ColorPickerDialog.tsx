import { ActivityBox } from "@/features/activity/components/ui";
import { ACTIVITY_THEME } from "@/features/activity/constants";
import { useI18n } from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import type { Activity } from "@/shared/types/models/activity";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import ColorPicker, {
  BrightnessSlider,
  HueSlider,
  SaturationSlider,
} from "reanimated-color-picker";
import { getShadowStyle, ShadowLevel } from "../../../shared/utils/shadowUtils";

export type ColorFormatsObject = Record<
  "hex" | "rgb" | "rgba" | "hsl" | "hsla" | "hsv" | "hsva" | "hwb" | "hwba",
  string
>;

type Props = {
  _dialogId?: string;
  initialColor?: string;
  activity?: Activity | null;
  categoryId?: string | null;
  activityName?: string | null;
  onConfirm?: (color: string) => void;
};

const ColorPickerDialog: React.FC<Props> = ({
  _dialogId,
  initialColor,
  activityName,
  activity,
  onConfirm,
}) => {
  const { t } = useI18n();

  const [currentColor, setCurrentColor] = useState(
    activity?.color ?? initialColor ?? "#FF6B6B"
  );

  // Default palette shown as round swatches above the sliders
  const defaultPalette: string[] = [
    "#FF6B6B",
    "#FF8C42",
    "#FFD93D",
    "#6BCB77",
    "#00C2CB",
    "#4D96FF",
    "#8E44AD",
    "#F49AC2",
    "#C9C9C9",
    "#333333",
    "#A3D9FF",
    "#E6E1C3",
  ];

  // Arrange swatches into 3 rows for display
  const rows = 3;
  const swatchesPerRow = Math.ceil(defaultPalette.length / rows);
  const paletteRows: string[][] = [];
  for (let i = 0; i < rows; i++) {
    const start = i * swatchesPerRow;
    paletteRows.push(defaultPalette.slice(start, start + swatchesPerRow));
  }

  // slider height responsive calculation
  const sliderHeight = Dimensions.get("window").width < 380 ? 100 : 200;

  useEffect(() => {
    if (!_dialogId) return;

    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.color-picker.title") || "Choose Color",
        backAction: true,
        onLeftAction: () => {
          if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        },
        rightAction: true,
        rightActionText: t("activity.color-picker.done") || "Done",
        onRightAction: () => {
          if (typeof onConfirm === "function") onConfirm(currentColor);
          if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        },
      },
      height: 85,
      preventClose: false,
    });
  }, [_dialogId, t, onConfirm, currentColor]);

  return (
    <View style={styles.container}>
      {/* Color Preview - show rectangular activity box with optional name */}
      <View style={styles.previewSection}>
        {/* Use the real ActivityBox component for accurate preview */}
        <ActivityBox
          activity={
            activity
              ? ({ ...activity, color: currentColor } as Activity)
              : ({
                  id: "preview",
                  name: activityName || t("activity.preview") || "Activity",
                  color: currentColor,
                } as unknown as Activity)
          }
          showTitle={true}
          boxHeight={56}
          boxWidth={220}
          style={styles.activityBoxPreview}
        />
      </View>

      {/* Palette swatches grid */}
      <View style={styles.swatchesGrid}>
        <View style={styles.swatchesContainer}>
          {paletteRows.map((row, ri) => (
            <View key={`row-${ri}`} style={styles.swatchesRow}>
              {row.map((c) => {
                const selected = c.toLowerCase() === currentColor.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCurrentColor(c)}
                    activeOpacity={0.8}
                    style={[
                      styles.swatchStyle,
                      { backgroundColor: c },
                      selected && styles.swatchSelected,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.pickerSection}>
        <View style={styles.colorPickerContainer}>
          <ColorPicker
            value={currentColor}
            sliderThickness={50}
            thumbSize={50}
            thumbShape="circle"
            adaptSpectrum
            boundedThumb
            style={styles.slidersRow}
            // Use the JS callback to receive plain JS color object and update preview
            onChangeJS={(colorObj: any) => {
              // colorObj has getters like .hex and .rgba; prefer hex when available
              try {
                if (!colorObj) return;
                const hex =
                  typeof colorObj.hex === "function"
                    ? colorObj.hex()
                    : colorObj.hex;
                if (typeof hex === "string" && hex.length > 0) {
                  setCurrentColor(hex);
                  return;
                }

                // fallback to rgba or rgb
                const rgba =
                  typeof colorObj.rgba === "function"
                    ? colorObj.rgba()
                    : colorObj.rgba;
                const rgb =
                  typeof colorObj.rgb === "function"
                    ? colorObj.rgb()
                    : colorObj.rgb;
                if (typeof rgba === "string" && rgba.length > 0) {
                  setCurrentColor(rgba);
                  return;
                }
                if (typeof rgb === "string" && rgb.length > 0) {
                  setCurrentColor(rgb);
                  return;
                }
              } catch {
                // ignore
              }
            }}
          >
            <View style={styles.sliderContainer}>
              <HueSlider
                style={[styles.sliderStyle, { height: sliderHeight }]}
                vertical
                reverse
              />
            </View>

            <View style={styles.sliderContainer}>
              <SaturationSlider
                style={[styles.sliderStyle, { height: sliderHeight }]}
                vertical
                reverse
              />
            </View>

            <View style={styles.sliderContainer}>
              <BrightnessSlider
                style={[styles.sliderStyle, { height: sliderHeight }]}
                vertical
                reverse
              />
            </View>
          </ColorPicker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  swatchesGrid: { alignItems: "center", marginBottom: 10 },
  activityBoxPreview: { marginBottom: 0, width: 220, alignItems: "flex-start" },
  colorPickerContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  previewSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  swatchesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    maxWidth: 320,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 34,
    width: 34,
    margin: 6,
  },
  swatchesRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: ACTIVITY_THEME.WHITE,
    ...getShadowStyle(ShadowLevel.High),
  },
  pickerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  slidersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    gap: 20,
  },
  sliderContainer: {
    alignItems: "center",
  },
  sliderStyle: {
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "white",
  },
});

export default ColorPickerDialog;
