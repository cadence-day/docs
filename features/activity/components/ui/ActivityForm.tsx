import { useI18n } from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useActivityCategoriesStore,
} from "@/shared/stores";
import type { Activity } from "@/shared/types/models";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ACTIVITY_THEME, WEIGHT_CONFIG } from "../../constants";
import { useActivityValidation } from "../../hooks";
import { ColorPicker } from "./form/ColorPicker";
import { CustomSlider } from "./form/CustomSlider";
import { FormInput } from "./form/FormInput";

interface ActivityFormProps {
  initialValues?: Partial<Activity>;
  onSubmit: (values: Partial<Activity>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

interface ActivityFormHandle {
  submit: () => void;
}

// Memoized category picker component
const CategoryPicker = React.memo<{
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onToggle: () => void;
  showPicker: boolean;
  disabled?: boolean;
  fieldTouched: boolean;
  error: string | null;
  t: (key: string) => string;
}>(
  ({
    selectedCategoryId,
    onCategorySelect,
    onToggle,
    showPicker,
    disabled = false,
    fieldTouched,
    error,
    t,
  }) => {
    const categories = useActivityCategoriesStore((state) => state.categories);

    const selectedCategory = useMemo(
      () => categories.find((cat) => cat.id === selectedCategoryId),
      [categories, selectedCategoryId]
    );

    const getCategoryDisplayName = useCallback(
      (categoryKey: string) => {
        const translatedName = t(`activity-categories.${categoryKey}`);
        return translatedName !== `activity-categories.${categoryKey}`
          ? translatedName
          : categoryKey;
      },
      [t]
    );

    const renderCategoryItem = useCallback(
      ({ item }: { item: any }) => (
        <Pressable
          style={styles.pickerItem}
          onPress={() => {
            onCategorySelect(item.id || null);
            onToggle();
          }}
        >
          <Text style={styles.pickerItemText}>
            {item.key ? getCategoryDisplayName(item.key) : item.key}
          </Text>
        </Pressable>
      ),
      [onCategorySelect, onToggle, getCategoryDisplayName]
    );

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {t("category")} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={onToggle}
          disabled={disabled}
        >
          <Text
            style={[
              styles.textInput,
              {
                color: selectedCategory
                  ? ACTIVITY_THEME.WHITE
                  : ACTIVITY_THEME.GRAY_LIGHT,
              },
            ]}
          >
            {selectedCategory?.key
              ? getCategoryDisplayName(selectedCategory.key)
              : t("select-a-category")}
          </Text>
        </TouchableOpacity>

        {showPicker && !disabled && (
          <View style={styles.pickerContainer}>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id || ""}
              renderItem={renderCategoryItem}
            />
          </View>
        )}

        {fieldTouched && error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

CategoryPicker.displayName = "CategoryPicker";

// Memoized parent activity picker
const ParentActivityPicker = React.memo<{
  selectedParentId: string | null;
  onParentSelect: (parentId: string | null) => void;
  onToggle: () => void;
  showPicker: boolean;
  disabled?: boolean;
  currentActivityId?: string;
  t: (key: string) => string;
}>(
  ({
    selectedParentId,
    onParentSelect,
    onToggle,
    showPicker,
    disabled = false,
    currentActivityId,
    t,
  }) => {
    const activities = useActivitiesStore((state) => state.activities);

    const selectedParent = useMemo(
      () => activities.find((act) => act.id === selectedParentId),
      [activities, selectedParentId]
    );

    const availableActivities = useMemo(
      () => activities.filter((act) => act.id !== currentActivityId),
      [activities, currentActivityId]
    );

    const renderParentItem = useCallback(
      ({ item }: { item: Activity }) => (
        <Pressable
          style={styles.pickerItem}
          onPress={() => {
            onParentSelect(item.id || null);
            onToggle();
          }}
        >
          <Text style={styles.pickerItemText}>{item.name}</Text>
        </Pressable>
      ),
      [onParentSelect, onToggle]
    );

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{t("parent-activity")}</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={onToggle}
          disabled={disabled}
        >
          <Text
            style={[
              styles.textInput,
              {
                color: selectedParent
                  ? ACTIVITY_THEME.WHITE
                  : ACTIVITY_THEME.GRAY_LIGHT,
              },
            ]}
          >
            {selectedParent?.name || t("none")}
          </Text>
        </TouchableOpacity>

        {showPicker && !disabled && (
          <View style={styles.pickerContainer}>
            <Pressable
              style={styles.pickerItem}
              onPress={() => {
                onParentSelect(null);
                onToggle();
              }}
            >
              <Text style={styles.pickerItemText}>{t("none")}</Text>
            </Pressable>
            <FlatList
              data={availableActivities}
              keyExtractor={(item) => item.id || ""}
              renderItem={renderParentItem}
            />
          </View>
        )}
      </View>
    );
  }
);

ParentActivityPicker.displayName = "ParentActivityPicker";

export const ActivityForm = forwardRef<ActivityFormHandle, ActivityFormProps>(
  ({ initialValues = {}, onSubmit, onCancel, isSubmitting = false }, ref) => {
    const { t } = useI18n();

    // Form state
    const [name, setName] = useState(initialValues.name || "");
    const [color, setColor] = useState(initialValues.color || "#FF6B6B");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
      initialValues.activity_category_id || null
    );
    const [selectedParentId, setSelectedParentId] = useState<string | null>(
      initialValues.parent_activity_id || null
    );
    const [weight, setWeight] = useState(() => {
      const dbWeight = initialValues.weight ?? 0.5;
      return String(Math.round(dbWeight * WEIGHT_CONFIG.SLIDER_STEPS));
    });
    const [status, setStatus] = useState<
      "ENABLED" | "DISABLED" | "DELETED" | null
    >(initialValues.status ?? "ENABLED");

    // UI state
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showParentPicker, setShowParentPicker] = useState(false);

    // Validation hook - destructure stable callbacks to avoid unstable object identity
    const validation = useActivityValidation(name, selectedCategoryId);
    const {
      resetValidation,
      validateField,
      validateAll,
      errors,
      fieldTouched,
    } = validation;

    // Store hooks
    const categories = useActivityCategoriesStore((state) => state.categories);
    const refreshCategories = useActivityCategoriesStore(
      (state) => state.refresh
    );

    // Load categories on mount
    useEffect(() => {
      if (categories.length === 0) {
        refreshCategories();
      }
    }, [categories.length, refreshCategories]);

    // Update form when initial values change (depend on specific primitive fields to
    // avoid reacting to a new object identity on every parent render)
    useEffect(() => {
      const nextName = initialValues.name || "";
      const nextColor = initialValues.color || "#FF6B6B";
      const nextCategory = initialValues.activity_category_id || null;
      const nextParent = initialValues.parent_activity_id || null;
      const dbWeight = initialValues.weight ?? 0.5;
      const nextWeight = String(
        Math.round(dbWeight * WEIGHT_CONFIG.SLIDER_STEPS)
      );
      const nextStatus = initialValues.status ?? "ENABLED";

      setName((prev) => (prev === nextName ? prev : nextName));
      setColor((prev) => (prev === nextColor ? prev : nextColor));
      setSelectedCategoryId((prev) =>
        prev === nextCategory ? prev : nextCategory
      );
      setSelectedParentId((prev) => (prev === nextParent ? prev : nextParent));
      setWeight((prev) => (prev === nextWeight ? prev : nextWeight));
      setStatus((prev) => (prev === nextStatus ? prev : nextStatus));

      // Use the stable resetValidation callback instead of the whole validation object
      resetValidation();
    }, [
      initialValues.id,
      initialValues.name,
      initialValues.color,
      initialValues.activity_category_id,
      initialValues.parent_activity_id,
      initialValues.weight,
      initialValues.status,
      resetValidation,
    ]);

    // Set color based on category
    useEffect(() => {
      if (selectedCategoryId && categories.length > 0) {
        const selectedCategory = categories.find(
          (cat) => cat.id === selectedCategoryId
        );
        if (selectedCategory?.color && !initialValues.color) {
          setColor(selectedCategory.color);
        }
      }
    }, [selectedCategoryId, categories, initialValues.color]);

    // Handlers
    const handleNameBlur = useCallback(() => {
      validateField("name", name);
    }, [validateField, name]);

    const handleCategoryToggle = useCallback(() => {
      setShowCategoryPicker((prev) => {
        const next = !prev;
        // if we are opening the picker, validate
        if (next) {
          validateField("category", selectedCategoryId);
        }
        return next;
      });
    }, [validateField, selectedCategoryId]);

    const handleCategorySelect = useCallback(
      (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        validateField("category", categoryId);
      },
      [validateField]
    );

    const handleParentToggle = useCallback(() => {
      setShowParentPicker((prev) => !prev);
    }, []);

    const handleSubmit = useCallback(async () => {
      const activity: Partial<Activity> = {
        name: name.trim(),
        color,
        activity_category_id: selectedCategoryId,
        parent_activity_id: selectedParentId,
        weight: parseInt(weight) / WEIGHT_CONFIG.SLIDER_STEPS,
        status,
      };

      if (validateAll(activity)) {
        await onSubmit(activity);
      }
    }, [
      name,
      color,
      selectedCategoryId,
      selectedParentId,
      weight,
      status,
      validateAll,
      onSubmit,
    ]);

    // Computed values
    const isEditingExisting = !!initialValues.id;
    const isDisabled = status === "DISABLED";

    // Expose submit method
    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
      }),
      [handleSubmit]
    );

    return (
      <View style={[styles.container, styles.contentContainer]}>
        {/* Enable/Disable toggle for existing activities */}
        {isEditingExisting && (
          <View style={styles.statusToggleContainer}>
            <TouchableOpacity
              onPress={() => setStatus(isDisabled ? "ENABLED" : "DISABLED")}
              disabled={isSubmitting}
            >
              <Text style={styles.statusToggleText}>
                {isDisabled
                  ? t("enable-activity")
                  : t("temporarily-disable-activity")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Name Input */}
        <FormInput
          label={t("name")}
          value={name}
          onChangeText={setName}
          onBlur={handleNameBlur}
          placeholder={t("enter-activity-name")}
          error={errors.name}
          showError={fieldTouched.name}
          disabled={isSubmitting || isDisabled}
          required
          autoCapitalize="words"
        />

        {/* Category Picker */}
        <CategoryPicker
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          onToggle={handleCategoryToggle}
          showPicker={showCategoryPicker}
          disabled={isDisabled}
          fieldTouched={fieldTouched.category}
          error={errors.category}
          t={t}
        />

        {/* Color Picker */}
        <ColorPicker
          selectedColor={color}
          onColorChange={setColor}
          disabled={isDisabled}
          label="COLOR"
          buttonText={t("tap-to-change-color")}
        />

        {/* Parent Activity Picker */}
        <ParentActivityPicker
          selectedParentId={selectedParentId}
          onParentSelect={setSelectedParentId}
          onToggle={handleParentToggle}
          showPicker={showParentPicker}
          disabled={isDisabled}
          currentActivityId={initialValues.id ?? undefined}
          t={t}
        />

        {/* Weight Slider */}
        <CustomSlider
          value={weight}
          onValueChange={setWeight}
          disabled={isDisabled}
          leftLabel={t("laid-back")}
          rightLabel={t("highly-energetic")}
        />
      </View>
    );
  }
);

ActivityForm.displayName = "ActivityForm";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statusToggleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  statusToggleText: {
    fontSize: 14,
    color: ACTIVITY_THEME.WHITE,
    textDecorationLine: "underline",
    fontWeight: "600",
    paddingVertical: 4,
  },
  fieldContainer: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: ACTIVITY_THEME.WHITE,
    marginBottom: 6,
    textTransform: "uppercase",
    fontFamily: "FoundersGrotesk-Regular",
  },
  required: {
    color: ACTIVITY_THEME.ERROR_COLOR,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: ACTIVITY_THEME.BORDER_PURPLE,
    borderBottomWidth: 0.5,
    minHeight: 36,
    minWidth: "100%",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: ACTIVITY_THEME.WHITE,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  pickerContainer: {
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 150,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ACTIVITY_THEME.GRAY_DARK,
  },
  pickerItemText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: ACTIVITY_THEME.ERROR_COLOR,
    marginTop: 6,
    marginLeft: 4,
  },
});
