import { ACTIVITY_THEME } from "@/features/activity/constants";
import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivityCategoriesStore } from "@/shared/stores";
import useDialogStore from "@/shared/stores/useDialogStore";
import ActivityCategory from "@/shared/types/models/activityCategory";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  _dialogId?: string;
  onConfirm?: (category: ActivityCategory | null) => void;
};

const CategoryPickerDialog: React.FC<Props> = ({ _dialogId, onConfirm }) => {
  const { t } = useI18n();
  const categories = useActivityCategoriesStore((s) => s.categories);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.pickActivityCategory") || "Select Category",
        // enable left/back action to return to the previous dialog (create activity)
        backAction: true,
        onLeftAction: () => {
          if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        },
        // Remove Done button since selection is immediate
      },
      height: 85,
      // Don't prevent this dialog from closing, but ensure underlying dialogs stay open
      preventClose: false,
    });
  }, [_dialogId, t]);

  const renderItem = ({ item }: { item: ActivityCategory }) => {
    const keyOrId = item.key ?? item.id ?? "";
    const display = (t(`activity-categories.${keyOrId}`) as string) || keyOrId;
    const isSelected = selectedId === item.id;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${display} category`}
        accessibilityHint="Tap to select this activity category"
        onPress={() => {
          // Set selection for visual feedback, then confirm after brief delay
          setSelectedId(item.id);
          setTimeout(() => {
            if (typeof onConfirm === "function") onConfirm(item);
            if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
          }, 150); // Brief visual feedback before closing
        }}
        style={({ pressed }) => [
          styles.tile,
          isSelected && styles.tileSelected,
          pressed && styles.tilePressed,
          {
            backgroundColor: item.color
              ? `${item.color}15`
              : styles.tile.backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: item.color ?? ACTIVITY_THEME.GRAY_MEDIUM,
              borderColor: isSelected ? COLORS.white : "transparent",
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        />
        <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
          {display}
        </Text>
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const keyExtractor = (i: ActivityCategory) => i.id ?? "";

  const data = useMemo(() => categories ?? [], [categories]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={keyExtractor}
        scrollEnabled={true}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  list: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  tile: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    minHeight: 80,
  },
  tilePressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  tileSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: `${COLORS.primary}20`,
    shadowOpacity: 0.2,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ACTIVITY_THEME.GRAY_DARK,
  },
  tileText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: ACTIVITY_THEME.WHITE,
    lineHeight: 18,
  },
  tileTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  selectionIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default CategoryPickerDialog;
