import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { Activity } from "@/shared/types/models";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export type ActivityDialogHandle = {
  confirm: () => void;
};

type Props = {
  selectedActivityId?: string | null;
  activities?: Activity[];
  onSelect?: (id: string) => void;
  // optional confirm callback that DialogHost will call when Done is pressed
  confirm?: () => void;
  headerProps?: any;
  // internal: dialog id when rendered via DialogHost
  _dialogId?: string;
};

const ActivityDialog = forwardRef<ActivityDialogHandle, Props>(
  (
    {
      selectedActivityId,
      activities = [],
      onSelect,
      confirm,
      headerProps,
      _dialogId,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const [temp, setTemp] = useState<string | null>(
      () => selectedActivityId ?? null
    );

    useEffect(() => {
      if ((selectedActivityId ?? null) !== temp)
        setTemp(selectedActivityId ?? null);
    }, [selectedActivityId]);

    // Persist temp to dialog store so DialogHost's Done handler can access it
    useEffect(() => {
      try {
        const useDialogStore =
          require("@/shared/stores/useDialogStore").default;
        if (_dialogId)
          useDialogStore
            .getState()
            .setDialogProps(_dialogId, { tempSelectedActivityId: temp });
      } catch (e) {
        // ignore
      }
    }, [temp, _dialogId]);

    const handleConfirm = () => {
      if (temp) onSelect?.(temp);
      confirm?.();
      try {
        const useDialogStore =
          require("@/shared/stores/useDialogStore").default;
        if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
      } catch (e) {
        // ignore
      }
    };

    useImperativeHandle(ref, () => ({ confirm: handleConfirm }));

    const renderItem = ({ item }: { item: Activity }) => {
      const id = item?.id ?? null;
      const isSelected = id !== null && temp === id;
      return (
        <Pressable
          onPress={() => {
            if (!id) return;
            setTemp(id);
          }}
          style={[styles.item, isSelected && styles.itemSelected]}
          accessibilityRole="button"
        >
          <Text
            style={[styles.itemText, isSelected && styles.itemTextSelected]}
          >
            {item?.name ?? t("activity-legend")}
          </Text>
        </Pressable>
      );
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {headerProps?.title ?? t("activity-legend")}
        </Text>

        <FlatList
          data={activities}
          keyExtractor={(it, idx) => String(it?.id ?? idx)}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.subtitle}>
              {t("no-activities") ?? "No activities"}
            </Text>
          }
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { padding: 16, width: "100%" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#666" },
  item: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  itemSelected: { backgroundColor: COLORS.primary },
  itemText: { fontSize: 14, color: "#fff" },
  itemTextSelected: { fontWeight: "700" },
});

export default ActivityDialog;
