import { useI18n } from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useActivityCategoriesStore,
} from "@/shared/stores";
import useDialogStore from "@/shared/stores/useDialogStore";
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
import { CustomSlider } from "./form/CustomSlider";
import { FormInput } from "./form/FormInput";

interface ActivityFormProps {
  initialValues?: Partial<Activity>;
  activity?: Activity;
  onSubmit: (values: Partial<Activity>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  _dialogId?: string;
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
  t: (key: string) => string;
}>(
  ({
    selectedCategoryId,
    onCategorySelect,
    onToggle,
    showPicker,
    disabled = false,
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
        <Text style={styles.label}>{t("category")}</Text>

        <TouchableOpacity
          style={[styles.inputContainer, styles.categoryInputContainer]}
          onPress={onToggle}
          disabled={disabled}
        >
          {/* Color swatch */}
          <View
            style={[
              styles.categorySwatch,
              {
                backgroundColor:
                  selectedCategory?.color || ACTIVITY_THEME.GRAY_DARK,
              },
            ]}
          />

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
  (
    {
      initialValues = {},
      activity,
      onSubmit,
      onCancel,
      isSubmitting = false,
      _dialogId,
    },
    ref
  ) => {
    const { t } = useI18n();
    // dialog is handled via the centralized dialog store

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
    const validation = useActivityValidation(name);
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
      // Open full-screen category dialog using the centralized CdDialog registry

      // Mark current dialog as persistent if we have a dialog ID
      if (_dialogId) {
        useDialogStore
          .getState()
          .setDialogProps(_dialogId, { preventClose: true });
      }

      useDialogStore.getState().openDialog({
        type: "activity-category-picker",
        props: {
          onConfirm: (category: any) => {
            setSelectedCategoryId(category?.id ?? null);

            // Remove persistent flag from parent dialog after category selection
            if (_dialogId) {
              useDialogStore
                .getState()
                .setDialogProps(_dialogId, { preventClose: false });
            }
          },
          activity: getActivityForDialogs(),
        },
      });
    }, [_dialogId]);

    // Helper to create an Activity-like object to pass into picker dialogs
    const getActivityForDialogs = useCallback(() => {
      if (activity) return activity;
      return {
        id: initialValues.id ?? "preview",
        name: name || initialValues.name || "",
        color,
      } as Partial<Activity>;
    }, [activity, initialValues.id, initialValues.name, name, color]);

    const handleCategorySelect = useCallback((categoryId: string | null) => {
      setSelectedCategoryId(categoryId);
    }, []);

    const handleParentToggle = useCallback(() => {
      setShowParentPicker((prev) => !prev);
    }, []);

    const handleColorPickerOpen = useCallback(() => {
      // Mark current dialog as persistent if we have a dialog ID
      if (_dialogId) {
        useDialogStore
          .getState()
          .setDialogProps(_dialogId, { preventClose: true });
      }

      useDialogStore.getState().openDialog({
        type: "activity-color-picker",
        props: {
          initialColor: color,
          categoryId: selectedCategoryId,
          activity: getActivityForDialogs(),
          onConfirm: (newColor: string) => {
            setColor(newColor);

            // Remove persistent flag from parent dialog after color selection
            if (_dialogId) {
              useDialogStore
                .getState()
                .setDialogProps(_dialogId, { preventClose: false });
            }
          },
        },
      });
    }, [color, selectedCategoryId, _dialogId]);

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
    // Category selection is handled via the centralized CdDialog registry

    return (
      <View style={[styles.container, styles.contentContainer]}>
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
          t={t}
        />

        {/* Color Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {t("color")} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={handleColorPickerOpen}
            disabled={isDisabled}
          >
            <Text style={styles.colorButtonText}>
              {t("tap-to-change-color")}
            </Text>
          </TouchableOpacity>
        </View>

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
  pickerContainerFull: {
    // allow the picker to fill remaining space in the form
    flex: 1,
    height: "100%",
    padding: 12,
  },
  categoryInputContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  categorySwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 1,
    borderColor: ACTIVITY_THEME.GRAY_DARK,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categoryTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 6,
    backgroundColor: ACTIVITY_THEME.FORM_BG,
    borderRadius: 8,
  },
  categoryTileSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
    borderWidth: 1,
    borderColor: ACTIVITY_THEME.GRAY_DARK,
  },
  categoryTileText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 13,
    flexShrink: 1,
  },
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 999,
    paddingTop: 40,
  },
  dialogHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: ACTIVITY_THEME.GRAY_DARK,
  },
  dialogCloseText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  dialogContent: {
    flex: 1,
    padding: 20,
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
  colorButton: {
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
