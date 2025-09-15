import { ENABLE_BUTTON_BG } from "@/features/activity/constants";
import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useActivityManagement } from "../hooks";
import { EditActivitiesViewProps } from "../types";
import {
  ActivityBox,
  ActivityLegendPlaceholderBox,
  AddActivityPlaceholder,
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
    includeAddButton: !!onAddActivity,
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: COLORS.text.header }}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Done button */}
      {onExitEditMode && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 16,
          }}
        ></View>
      )}

      {/* Enabled Activities Section */}
      <View>
        {enabledActivities.length > 0 ? (
          <Text
            style={{
              color: COLORS.text.subheader,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 12,
              textAlign: "left",
            }}
          >
            {t("active-activities")} ({activityOrder.length})
            {isSavingOrder && (
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.secondary,
                  fontWeight: "normal",
                }}
              >
                {" "}
                - {t("common.saving")}...
              </Text>
            )}
          </Text>
        ) : (
          <Text
            style={{
              color: COLORS.text.subheader,
              fontSize: 14,
              marginBottom: 12,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {t("no-active-activities")}
          </Text>
        )}

        {/* Grid Container */}
        <View
          ref={containerRef}
          onLayout={handleContainerLayout}
          style={{
            position: "relative",
            minHeight: minHeight,
          }}
        >
          <GridView
            items={activityOrder}
            totalRows={totalRows}
            columns={effectiveGridConfig.columns}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            gridGap={gridGap}
            dragPlaceholderIndex={dragPlaceholderIndex}
            onAdd={onAddActivity || null}
            placeholderBorderColor="#4CAF50"
            placeholderBorderWidth={2}
            renderAddPlaceholder={(onPress, boxWidth) => (
              <AddActivityPlaceholder
                onPress={onAddActivity!}
                boxWidth={boxWidth}
              />
            )}
            renderBackgroundCell={({
              index,
              isPlaceholder,
              isAddPlaceholder,
            }) => {
              const activityStartIndex = onAddActivity ? 1 : 0;
              const activityIndex = index - activityStartIndex;
              const isOccupied =
                index >= activityStartIndex &&
                activityIndex < activityOrder.length;

              if (isPlaceholder) return <ActivityLegendPlaceholderBox />;
              if (!isOccupied && !isPlaceholder && !isAddPlaceholder)
                return <ActivityLegendPlaceholderBox />;
              if (isAddPlaceholder)
                return (
                  <AddActivityPlaceholder
                    onPress={onAddActivity!}
                    boxWidth={80}
                  />
                );

              return null;
            }}
            renderItem={(activity, index) => (
              <DraggableActivityItem
                key={activity.id}
                activity={activity}
                index={onAddActivity ? index + 1 : index}
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
      {disabledActivities.length > 0 && (
        <View
          style={{
            height: 1,
            backgroundColor: COLORS.separatorline.light,
            marginVertical: 20,
          }}
        />
      )}

      {/* Disabled Activities Section */}
      {disabledActivities.length > 0 && (
        <View>
          <Text
            style={{
              color: COLORS.text.subheader,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 12,
              textAlign: "left",
            }}
          >
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
                style={{
                  width: disabledItemWidthPx as any,
                  position: "relative",
                  marginBottom: 15,
                  opacity: 0.6,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 4,
                }}
              >
                <ActivityBox
                  activity={activity}
                  onPress={() => onActivityPress(activity)}
                  boxWidth={Math.max(0, disabledItemWidthPx - 8)}
                />

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: ENABLE_BUTTON_BG,
                    borderRadius: 12,
                    width: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#fff",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                    zIndex: 1001,
                  }}
                  onPress={async () => {
                    try {
                      await handleEnableActivity(activity);
                    } catch (error) {
                      GlobalErrorHandler.logError(error, "ENABLE_ACTIVITY", {
                        activityId: activity.id,
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={10} color="#fff" />
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
