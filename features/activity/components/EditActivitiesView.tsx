import { ENABLE_BUTTON_BG } from "@/features/activity/constants";
import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { HIT_SLOP_24 } from "@/shared/constants/hitSlop";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { useI18n } from "@/shared/hooks/useI18n";
import { generalStyles } from "@/shared/styles/general";
import { Logger } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React, { useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getShadowStyle, ShadowLevel } from "../../../shared/utils/shadowUtils";
import { useActivityManagement } from "../hooks";
import { EditActivitiesViewProps } from "../types";
import {
  ActivityBox,
  ActivityLegendPlaceholderBox,
  DraggableActivityItem,
} from "./ui";
import GridView from "./ui/GridView";

const EditActivitiesView: React.FC<EditActivitiesViewProps> = ({
  onActivityPress,
  onDragStateChange,
  onExitEditMode,
  gridConfig,
  onAddActivity,
  onDisableActivity,
}) => {
  const { t } = useI18n();
  const [containerWidth, setContainerWidth] = useState(350);
  const containerRef = useRef<View>(null);

  // Check if glass effect is available
  const canUseGlassEffect = useMemo(() => {
    if (Platform.OS !== "ios") return false;
    return isLiquidGlassAvailable();
  }, []);

  // Use the combined activity management hook (no activities prop needed)
  const {
    gridProperties,
    effectiveGridConfig,
    enabledActivities,
    disabledActivities,
    activityOrder,
    draggedActivityId,
    dragPlaceholderIndex,
    isShakeMode,
    handleDragStart,
    handleDragEnd,
    handleReorder,
    handlePlaceholderChange,
    setIsShakeMode,
    handleDisableActivity,
    handleEnableActivity,
    isSavingOrder,
    isLoading,
  } = useActivityManagement({
    gridConfig,
    includeAddButton: false,
    onDragStateChange,
  });

  // Enable shake mode when component mounts (edit mode should always have shaking)
  React.useEffect(() => {
    setIsShakeMode(true);

    // Cleanup: disable shake mode when component unmounts
    return () => {
      setIsShakeMode(false);
    };
  }, [setIsShakeMode]);

  // Get grid properties
  const { totalRows, itemWidth, minHeight, itemHeight, gridGap } =
    gridProperties;

  // Disabled activities should always render in a 4-column grid without placeholders
  const disabledColumns = 4;
  const disabledItemWidthPx = Math.floor(
    (containerWidth - gridGap * (disabledColumns - 1)) / disabledColumns
  );
  const disabledTotalRows =
    Math.ceil(disabledActivities.length / disabledColumns) || 1;

  const handleContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Done button */}
      {onExitEditMode && <View style={styles.headerRight} />}

      {/* Enabled Activities Section */}
      <View>
        {enabledActivities.length > 0 ? (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>
              {t("active-activities")} ({activityOrder.length})
              {isSavingOrder && (
                <Text style={styles.savingText}>
                  {" "}
                  - {t("common.saving")}...
                </Text>
              )}
            </Text>
            {onAddActivity && (
              <Pressable
                onPress={onAddActivity}
                hitSlop={HIT_SLOP_24}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <View style={styles.addButtonInner}>
                  <Ionicons
                    name="add"
                    size={24}
                    color={COLORS.text.subheader}
                  />
                </View>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.noActiveText}>{t("no-active-activities")}</Text>
            {onAddActivity && (
              <Pressable
                onPress={onAddActivity}
                hitSlop={HIT_SLOP_24}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <View style={styles.addButtonInner}>
                  <Ionicons
                    name="add"
                    size={24}
                    color={COLORS.text.subheader}
                  />
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Grid Container */}
        <View
          ref={containerRef}
          onLayout={handleContainerLayout}
          style={[styles.gridContainer, { minHeight }]}
        >
          <GridView
            items={activityOrder}
            totalRows={totalRows}
            columns={effectiveGridConfig.columns}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            gridGap={gridGap}
            dragPlaceholderIndex={dragPlaceholderIndex}
            onAdd={null}
            placeholderBorderColor="#4CAF50"
            placeholderBorderWidth={2}
            renderBackgroundCell={({
              index,
              isPlaceholder,
              isAddPlaceholder,
            }) => {
              const isOccupied = index < activityOrder.length;

              if (isPlaceholder) return <ActivityLegendPlaceholderBox />;
              if (!isOccupied && !isPlaceholder && !isAddPlaceholder)
                return <ActivityLegendPlaceholderBox />;

              return null;
            }}
            renderItem={(activity, index) => (
              <DraggableActivityItem
                key={activity.id}
                activity={activity}
                index={index}
                activityOrder={activityOrder}
                onActivityPress={onActivityPress}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onReorder={handleReorder}
                onPlaceholderChange={handlePlaceholderChange}
                gridConfig={effectiveGridConfig}
                containerWidth={containerWidth}
                isShakeMode={isShakeMode}
                draggedActivityId={draggedActivityId}
                dragPlaceholderIndex={dragPlaceholderIndex}
                onDisableActivity={onDisableActivity ?? handleDisableActivity}
              />
            )}
          />
        </View>
      </View>

      {/* Visual Separator */}
      {disabledActivities.length > 0 && <View style={styles.separator} />}

      {/* Disabled Activities Section */}
      {disabledActivities.length > 0 && (
        <View>
          <Text style={styles.disabledSectionHeader}>
            {t("disabled-activities")} ({disabledActivities.length})
          </Text>

          {/* Disabled activities rendered in a grid */}
          <GridView
            items={disabledActivities}
            totalRows={disabledTotalRows}
            columns={disabledColumns}
            itemWidth={disabledItemWidthPx}
            itemHeight={itemHeight}
            gridGap={gridGap}
            renderBackgroundCell={() => null}
            renderItem={(activity) => (
              <View
                key={activity.id}
                style={[
                  styles.disabledItemWrapper,
                  { width: disabledItemWidthPx as any },
                ]}
              >
                <ActivityBox
                  activity={activity}
                  onPress={() => onActivityPress(activity)}
                  boxWidth={Math.max(0, disabledItemWidthPx - 8)}
                />

                <TouchableOpacity
                  style={[
                    styles.enableButton,
                    getShadowStyle(ShadowLevel.Medium),
                    !canUseGlassEffect && styles.enableButtonFallback,
                  ]}
                  onPress={async () => {
                    try {
                      await handleEnableActivity(activity);
                    } catch (error) {
                      Logger.logError(error, "ENABLE_ACTIVITY", {
                        activityId: activity.id,
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {canUseGlassEffect ? (
                    <GlassView
                      glassEffectStyle="regular"
                      tintColor={ENABLE_BUTTON_BG}
                      style={styles.glassButton}
                    >
                      <Ionicons
                        name="add"
                        size={14}
                        color={COLORS.neutral.white}
                      />
                    </GlassView>
                  ) : (
                    <View style={styles.glassmorphismFallback}>
                      <Ionicons
                        name="add"
                        size={14}
                        color={COLORS.neutral.white}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default EditActivitiesView;

const styles = StyleSheet.create({
  container: {
    ...CONTAINER.basic.view,
  },
  loadingContainer: {
    ...CONTAINER.basic.centeredView,
  },
  loadingText: {
    ...generalStyles.bodyMedium,
    color: COLORS.text.header,
  },
  headerRight: {
    ...CONTAINER.basic.row,
    ...CONTAINER.layout.justify.end,
    ...CONTAINER.padding.horizontal.lg,
    ...CONTAINER.padding.vertical.base,
    ...CONTAINER.margin.bottom.lg,
  },
  sectionHeaderContainer: {
    ...CONTAINER.basic.row,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.justify.between,
    ...CONTAINER.margin.bottom.md,
  },
  sectionHeader: {
    ...generalStyles.h4,
    color: COLORS.text.subheader,
    textAlign: "left",
    flex: 1,
  },
  savingText: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.secondary,
    fontWeight: TYPOGRAPHY.weights.normal,
  },
  noActiveText: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.subheader,
    textAlign: "left",
    fontStyle: "italic",
    flex: 1,
  },
  addButton: {
    ...CONTAINER.border.radius.lg,
    width: 32,
    height: 32,
    ...CONTAINER.margin.left.md,
  },
  addButtonPressed: {
    backgroundColor: COLORS.neutral.veryLightGray,
    borderRadius: 20,
  },
  addButtonInner: {
    width: "100%",
    height: "100%",
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    backgroundColor: "transparent",
  },
  gridContainer: {
    ...CONTAINER.layout.position.relative,
  },
  disabledSectionHeader: {
    ...generalStyles.h4,
    color: COLORS.text.subheader,
    textAlign: "left",
    ...CONTAINER.margin.bottom.lg,
    ...CONTAINER.margin.top.md,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separatorline.light,
    ...CONTAINER.margin.vertical.xl,
  },
  disabledItemWrapper: {
    ...CONTAINER.layout.position.relative,
    marginBottom: 2, // Match active activities grid gap
    ...CONTAINER.opacity.visible,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.padding.horizontal.sm,
  },
  enableButton: {
    ...CONTAINER.layout.position.absolute,
    top: -8,
    right: -8,
    ...CONTAINER.border.radius.lg,
    width: 20,
    height: 20,
    zIndex: 1001,
    overflow: "hidden",
  },
  enableButtonFallback: {
    backgroundColor: ENABLE_BUTTON_BG,
    ...CONTAINER.border.width.thin,
    borderColor: COLORS.neutral.white,
  },
  glassButton: {
    width: "100%",
    height: "100%",
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
  },
  glassmorphismFallback: {
    width: "100%",
    height: "100%",
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    backgroundColor: "rgba(76, 175, 79, 0.8)",
  },
});
