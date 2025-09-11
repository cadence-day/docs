import { ENABLE_BUTTON_BG } from "@/features/activity/constants";
import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivitiesStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { EditActivitiesViewProps } from "../types";
import {
  ActivityBox,
  ActivityLegendPlaceholderBox,
  AddActivityPlaceholder,
  DraggableActivityItem,
} from "./ui";
import GridView from "./ui/GridView";
import {
  calculateGridProperties,
  createDefaultGridConfig,
} from "./utils/gridUtils";

const EditActivitiesView: React.FC<EditActivitiesViewProps> = ({
  activities,
  onActivityPress,
  onDragStateChange,
  gridConfig,
  onAddActivity,
}) => {
  const { t } = useI18n();
  const enabledActivities = activities.filter((a) => a.status === "ENABLED");
  const disabledActivities = activities.filter((a) => a.status === "DISABLED");

  // Include add activity placeholder in grid calculation if onAddActivity is provided
  const totalItemsForGrid = enabledActivities.length + (onAddActivity ? 1 : 0);
  const { totalRows, itemWidth, minHeight, itemHeight, gridGap } =
    calculateGridProperties(
      totalItemsForGrid,
      createDefaultGridConfig(gridConfig || {})
    );

  // const itemHeight = 40; // Default item height
  // const itemWidth = `${100 / gridConfig.columns}%`;

  const [isShakeMode, setIsShakeMode] = useState(false);
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(
    null
  );
  const [activityOrder, setActivityOrder] = useState(enabledActivities);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [dragPlaceholderIndex, setDragPlaceholderIndex] = useState<
    number | null
  >(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const containerRef = useRef<View>(null);

  // Disabled activities should always render in a 4-column grid without placeholders
  const disabledColumns = 4;
  // compute pixel width for disabled items based on container width so RN can resolve percent sizing
  const disabledItemWidthPx = Math.floor(
    (containerWidth - gridGap * (disabledColumns - 1)) / disabledColumns
  );
  const disabledTotalRows =
    Math.ceil(disabledActivities.length / disabledColumns) || 1;

  // Get store functions
  const updateActivityOrderInStore = useActivitiesStore(
    (state) => state.updateActivityOrder
  );
  const updateActivityInStore = useActivitiesStore(
    (state) => state.updateActivity
  );
  const disableActivityInStore = useActivitiesStore(
    (state) => state.disableActivity
  );
  const enableActivityInStore = useActivitiesStore(
    (state) => state.enableActivity
  );

  // Update activity order when activities prop changes
  useEffect(() => {
    setActivityOrder(enabledActivities);
  }, [activities]);

  // Start shake mode on mount
  useEffect(() => {
    setIsShakeMode(true);
    return () => {
      setIsShakeMode(false);
    };
  }, []);

  const saveActivityOrder = async (newOrder: Activity[]) => {
    setIsSavingOrder(true);
    try {
      if (updateActivityOrderInStore) {
        const fullOrder = [...newOrder, ...disabledActivities];
        await updateActivityOrderInStore(fullOrder);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving activity order:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await disableActivityInStore(activityId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error disabling activity:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleEnableActivity = async (activity: Activity) => {
    try {
      if (activity.id) {
        await enableActivityInStore(activity.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error enabling activity:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDragStart = (activityId: string) => {
    setDraggedActivityId(activityId);
    onDragStateChange?.(true);
  };

  const handleDragEnd = () => {
    setDraggedActivityId(null);
    onDragStateChange?.(false);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...activityOrder];
    const [draggedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, draggedItem);

    setActivityOrder(newOrder);
    saveActivityOrder(newOrder);
  };

  const handlePlaceholderChange = (index: number | null) => {
    setDragPlaceholderIndex(index);
  };

  return (
    <View>
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
            {t("active-activities")} ({enabledActivities.length})
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
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setContainerWidth(width);
          }}
          style={{
            position: "relative",
            minHeight: totalRows * (itemHeight + gridGap),
          }}
        >
          <GridView
            items={activityOrder}
            totalRows={totalRows}
            columns={(gridConfig?.columns as number) || 4}
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
                gridConfig={gridConfig || { columns: 4 }}
                containerWidth={containerWidth}
                isShakeMode={isShakeMode}
                draggedActivityId={draggedActivityId}
                dragPlaceholderIndex={dragPlaceholderIndex}
                onDeleteActivity={handleDeleteActivity}
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
            marginVertical: "2%",
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
              marginTop: "2%",
              textAlign: "left",
            }}
          >
            {t("disabled-activities")} ({disabledActivities.length})
          </Text>
        </View>
      )}

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
              // give ActivityBox a numeric pixel width so it fills the column correctly
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
                  console.error("Error enabling activity:", error);
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
  );
};

export default EditActivitiesView;
