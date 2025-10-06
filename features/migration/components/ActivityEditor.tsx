import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { CdTextInput } from "@/shared/components/CadenceUI/CdTextInput";
import { ACTIVITY_COLORS, COLORS } from "@/shared/constants/COLORS";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import type { ActivityCategory } from "@/shared/types/models";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { V1Activity } from "../api/migration";

interface ActivityEditorProps {
  activity: V1Activity;
  onActivityChange: (updatedActivity: V1Activity) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
  activity,
  onActivityChange,
  onSave,
  onCancel,
}) => {
  const { categories, getAllCategories } = useActivityCategoriesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentColor, setCurrentColor] = useState(activity.color || "#FF6B6B");

  useEffect(() => {
    loadCategories();
  }, []);

  // Update color when currentColor changes
  useEffect(() => {
    onActivityChange({ ...activity, color: currentColor });
  }, [currentColor]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      await getAllCategories();
      console.log("Categories loaded:", categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId) {
      onActivityChange({ ...activity, category_id: categoryId });
    }
  };

  const handleNameChange = (name: string) => {
    onActivityChange({ ...activity, name });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Name Input */}
        <View style={styles.fieldContainer}>
          <CdTextInput
            label="Activity Name"
            value={activity.name}
            onChangeText={handleNameChange}
            placeholder="Enter activity name"
            isRequired
          />
        </View>

        {/* Category Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category: ActivityCategory) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  activity.category_id === category.id &&
                    styles.categoryOptionSelected,
                  { backgroundColor: category.color || COLORS.secondary },
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    activity.category_id === category.id &&
                      styles.categoryOptionTextSelected,
                  ]}
                >
                  {category.key
                    ? category.key.charAt(0).toUpperCase() +
                      category.key.slice(1)
                    : "Category"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Section */}
        <View style={styles.colorSection}>
          {/* Color Preview */}
          <View style={styles.colorPreviewContainer}>
            <View
              style={[styles.colorPreview, { backgroundColor: activity.color }]}
            />
            <Text style={styles.colorValue}>{activity.color}</Text>
          </View>

          {/* Color Palette */}
          <View style={styles.colorPalette}>
            {ACTIVITY_COLORS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  activity.color === color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  onActivityChange({ ...activity, color });
                }}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CdButton
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.actionButton}
          />
          <CdButton
            title="Save Changes"
            onPress={onSave}
            variant="primary"
            style={styles.actionButton}
            disabled={!activity.name.trim() || !activity.category_id}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  categoryOptionTextSelected: {
    fontWeight: "700",
  },
  colorSection: {
    marginBottom: 24,
    marginTop: 16,
  },
  colorPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  colorValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    fontFamily: "monospace",
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    borderColor: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 32,
  },
  actionButton: {
    flex: 1,
  },
});
