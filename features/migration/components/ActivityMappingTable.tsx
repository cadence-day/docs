import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface SourceActivity {
  activity_id: string;
  name: string;
  color: string;
}

export interface TargetActivity {
  id: string;
  name: string;
  color: string;
  weight?: number;
  activity_categories?: string[];
}

export interface ActivityMapping {
  sourceId: string;
  targetId?: string;
  createNew?: boolean;
  newActivityData?: {
    name: string;
    color: string;
    category?: string;
  };
}

interface ActivityMappingTableProps {
  sourceActivities: SourceActivity[];
  targetActivities: TargetActivity[];
  mappings: ActivityMapping[];
  onMappingChange: (mappings: ActivityMapping[]) => void;
}

export function ActivityMappingTable({
  sourceActivities,
  targetActivities,
  mappings,
  onMappingChange,
}: ActivityMappingTableProps) {
  const { t } = useTranslation();
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityColor, setNewActivityColor] = useState("#FF6B6B");
  const [newActivityCategory, setNewActivityCategory] = useState("");

  const handleMappingSelect = (sourceId: string, targetId: string) => {
    if (targetId === "CREATE_NEW") {
      setSelectedSourceId(sourceId);
      const sourceActivity = sourceActivities.find(
        (a) => a.activity_id === sourceId
      );
      setNewActivityName(sourceActivity?.name || "");
      setNewActivityColor(sourceActivity?.color || "#FF6B6B");
      setShowNewActivityModal(true);
    } else {
      const newMappings = mappings.map((m) =>
        m.sourceId === sourceId ? { sourceId, targetId, createNew: false } : m
      );
      onMappingChange(newMappings);
    }
  };

  const handleCreateNewActivity = () => {
    if (!newActivityName.trim()) {
      Alert.alert(t("common.error"), t("migration.activities.name-required"));
      return;
    }

    if (selectedSourceId) {
      const newMappings = mappings.map((m) =>
        m.sourceId === selectedSourceId
          ? {
              sourceId: selectedSourceId,
              createNew: true,
              newActivityData: {
                name: newActivityName,
                color: newActivityColor,
                category: newActivityCategory,
              },
            }
          : m
      );
      onMappingChange(newMappings);
    }

    setShowNewActivityModal(false);
    setSelectedSourceId(null);
    setNewActivityName("");
    setNewActivityColor("#FF6B6B");
    setNewActivityCategory("");
  };

  const getMapping = (sourceId: string): ActivityMapping | undefined => {
    return mappings.find((m) => m.sourceId === sourceId);
  };

  const getMappingDisplay = (sourceId: string): string => {
    const mapping = getMapping(sourceId);
    if (!mapping) return t("migration.activities.select-mapping");

    if (mapping.createNew && mapping.newActivityData) {
      return `${t("migration.activities.new")}: ${mapping.newActivityData.name}`;
    }

    const targetActivity = targetActivities.find(
      (a) => a.id === mapping.targetId
    );
    return targetActivity?.name || t("migration.activities.select-mapping");
  };

  const availableColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA15E",
    "#BC6C25",
    "#540B0E",
    "#9B2226",
    "#AE2012",
  ];

  const categories = [
    "work",
    "personal",
    "health",
    "learning",
    "social",
    "creative",
    "other",
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("migration.activities.title")}</Text>
      <ScrollView style={styles.scrollView}>
        {sourceActivities.map((source) => (
          <View key={source.activity_id} style={styles.mappingRow}>
            <View style={styles.sourceActivity}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: source.color },
                ]}
              />
              <Text style={styles.activityName}>{source.name}</Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.textIcons}
              style={styles.arrow}
            />

            <View style={styles.targetSelector}>
              <Picker
                selectedValue={getMapping(source.activity_id)?.targetId || ""}
                onValueChange={(value) =>
                  handleMappingSelect(source.activity_id, value)
                }
                style={styles.picker}
              >
                <Picker.Item
                  label={t("migration.activities.select-mapping")}
                  value=""
                />
                <Picker.Item
                  label={t("migration.activities.create-new")}
                  value="CREATE_NEW"
                />
                {targetActivities.map((target) => (
                  <Picker.Item
                    key={target.id}
                    label={target.name}
                    value={target.id}
                  />
                ))}
              </Picker>
              <Text style={styles.mappingDisplay}>
                {getMappingDisplay(source.activity_id)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showNewActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("migration.activities.create-new-activity")}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("migration.activities.name")}
              </Text>
              <TextInput
                style={styles.textInput}
                value={newActivityName}
                onChangeText={setNewActivityName}
                placeholder={t("migration.activities.enter-name")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("migration.activities.color")}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorPicker}
              >
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setNewActivityColor(color)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newActivityColor === color && styles.selectedColor,
                    ]}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("migration.activities.category")}
              </Text>
              <Picker
                selectedValue={newActivityCategory}
                onValueChange={setNewActivityCategory}
                style={styles.categoryPicker}
              >
                <Picker.Item
                  label={t("migration.activities.select-category")}
                  value=""
                />
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat}
                    label={t(`activities.categories.${cat}`)}
                    value={cat}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNewActivityModal(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateNewActivity}
              >
                <Text style={styles.createButtonText}>
                  {t("common.create")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 300,
  },
  mappingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sourceActivity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  activityName: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  arrow: {
    marginHorizontal: 12,
  },
  targetSelector: {
    flex: 1,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  mappingDisplay: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  colorPicker: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  categoryPicker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
});
