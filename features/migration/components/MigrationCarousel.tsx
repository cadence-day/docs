// ActivityBox no longer used in summary; keep other imports
import { CdButton } from "@/shared/components/CadenceUI/CdButton";
import { COLORS } from "@/shared/constants/COLORS";
import type { Activity } from "@/shared/types/models/activity";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import type { V1Activity, V2Activity } from "../api/migration";
import { ActivityEditor } from "./ActivityEditor";
import { ProgressBar } from "./ProgressBar";

interface MigrationCarouselProps {
  v1Activities: V1Activity[];
  v2Activities: V2Activity[];
  onMigrationComplete: (mappings: ActivityMapping[]) => void;
  onCancel: () => void;
}

export interface ActivityMapping {
  v1ActivityId: string;
  v2ActivityId?: string;
  action: "create_new" | "map_existing";
  updatedActivity?: V1Activity;
}

export const MigrationCarousel: React.FC<MigrationCarouselProps> = ({
  v1Activities,
  v2Activities,
  onMigrationComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activityMappings, setActivityMappings] = useState<ActivityMapping[]>(
    []
  );
  const [editingActivity, setEditingActivity] = useState<V1Activity | null>(
    null
  );
  const [selectedExistingActivity, setSelectedExistingActivity] = useState<
    string | null
  >(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const totalSteps = v1Activities.length + 1; // +1 for summary step
  const currentActivity =
    currentStep < v1Activities.length ? v1Activities[currentStep] : null;

  // Prepare dropdown data for existing activities
  const dropdownData = v2Activities.map((activity) => ({
    label: activity.name,
    value: activity.id,
    color: activity.color,
    categories: activity.activity_categories.join(", ") || "No category",
  }));

  const scrollToStep = (step: number) => {
    scrollViewRef.current?.scrollTo({
      y: step * screenHeight,
      animated: true,
    });
  };

  const handleCreateNew = () => {
    if (!currentActivity) return;

    // Check if mapping already exists to avoid duplicates
    const existingMapping = activityMappings.find(
      (m) => m.v1ActivityId === currentActivity.activity_id
    );
    if (existingMapping) {
      // Remove existing mapping first
      setActivityMappings((prev) =>
        prev.filter((m) => m.v1ActivityId !== currentActivity.activity_id)
      );
    }

    const mapping: ActivityMapping = {
      v1ActivityId: currentActivity.activity_id,
      action: "create_new",
      updatedActivity: {
        ...currentActivity,
        name: currentActivity.custom_name || currentActivity.name,
        color: currentActivity.custom_color || currentActivity.color,
      },
    };

    setActivityMappings((prev) => [...prev, mapping]);
    setEditingActivity({
      ...currentActivity,
      name: currentActivity.custom_name || currentActivity.name,
      color: currentActivity.custom_color || currentActivity.color,
    });
  };

  const handleMapExisting = () => {
    if (!currentActivity || !selectedExistingActivity) return;

    // Check if mapping already exists to avoid duplicates
    const existingMapping = activityMappings.find(
      (m) => m.v1ActivityId === currentActivity.activity_id
    );
    if (existingMapping) {
      // Remove existing mapping first
      setActivityMappings((prev) =>
        prev.filter((m) => m.v1ActivityId !== currentActivity.activity_id)
      );
    }

    const mapping: ActivityMapping = {
      v1ActivityId: currentActivity.activity_id,
      v2ActivityId: selectedExistingActivity,
      action: "map_existing",
    };

    setActivityMappings((prev) => [...prev, mapping]);
    setSelectedExistingActivity(null); // Reset selection for next activity
    goToNextStep();
  };

  const handleDropdownChange = (item: {
    label: string;
    value: string;
    color: string;
    categories: string;
  }) => {
    setSelectedExistingActivity(item.value);
  };

  const handleActivitySave = () => {
    if (!editingActivity || !currentActivity) return;

    // Update the mapping with the edited activity
    setActivityMappings((prev) =>
      prev.map((mapping) =>
        mapping.v1ActivityId === currentActivity.activity_id
          ? { ...mapping, updatedActivity: editingActivity }
          : mapping
      )
    );

    setEditingActivity(null);
    goToNextStep();
  };

  const handleActivityCancel = () => {
    if (!currentActivity) return;

    // Remove the mapping for this activity
    setActivityMappings((prev) =>
      prev.filter(
        (mapping) => mapping.v1ActivityId !== currentActivity.activity_id
      )
    );

    setEditingActivity(null);
  };

  const handleActivityChange = (updatedActivity: V1Activity) => {
    setEditingActivity(updatedActivity);
  };

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    scrollToStep(nextStep);
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;

      // If we're currently editing, cancel the edit
      if (editingActivity) {
        setEditingActivity(null);
      }

      // Remove the current mapping if going back
      if (currentActivity) {
        setActivityMappings((prev) =>
          prev.filter(
            (mapping) => mapping.v1ActivityId !== currentActivity.activity_id
          )
        );
      }

      setCurrentStep(prevStep);
      scrollToStep(prevStep);
    }
  };

  const handleComplete = () => {
    try {
      onMigrationComplete(activityMappings);
    } catch (error) {
      GlobalErrorHandler.logError(error, "handleMigrationComplete");
    }
  };

  const getCurrentMapping = (): ActivityMapping | undefined => {
    if (!currentActivity) return undefined;
    return activityMappings.find(
      (m) => m.v1ActivityId === currentActivity.activity_id
    );
  };

  const renderActivityStep = (activity: V1Activity, index: number) => {
    const currentMapping = getCurrentMapping();
    const isCurrentStep = index === currentStep;

    if (!isCurrentStep) return null;

    // If we're editing this activity, show the editor
    if (editingActivity && currentMapping?.action === "create_new") {
      return (
        <View
          key={activity.activity_id}
          style={[styles.stepContainer, { minHeight: screenHeight }]}
        >
          <ActivityEditor
            activity={editingActivity}
            onActivityChange={handleActivityChange}
            onSave={handleActivitySave}
            onCancel={handleActivityCancel}
          />
        </View>
      );
    }

    return (
      <View
        key={activity.activity_id}
        style={[styles.stepContainer, { minHeight: screenHeight }]}
      >
        <View style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: activity.custom_color || activity.color },
              ]}
            />
            <Text style={styles.activityName}>
              {activity.custom_name || activity.name}
            </Text>
          </View>

          {/* Option 1: Map to existing activity */}
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>Map to existing activity</Text>
            {v2Activities.length > 0 ? (
              <View style={styles.dropdownContainer}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={dropdownData}
                  search
                  maxHeight={400}
                  mode="modal"
                  labelField="label"
                  valueField="value"
                  placeholder="Select an existing activity"
                  searchPlaceholder="Search activities..."
                  value={selectedExistingActivity}
                  onChange={handleDropdownChange}
                  renderItem={(item) => (
                    <View style={styles.dropdownItem}>
                      <View
                        style={[
                          styles.dropdownColorIndicator,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <View style={styles.dropdownItemContent}>
                        <Text style={styles.dropdownItemText}>
                          {item.label}
                        </Text>
                        <Text style={styles.dropdownItemDetail}>
                          {item.categories}
                        </Text>
                      </View>
                    </View>
                  )}
                />
                {selectedExistingActivity && (
                  <CdButton
                    title="Map to Selected Activity"
                    onPress={handleMapExisting}
                    variant="secondary"
                    style={styles.mapButton}
                  />
                )}
              </View>
            ) : (
              <Text style={styles.noActivitiesText}>
                No existing activities found. You'll need to create a new one.
              </Text>
            )}
          </View>

          {/* Option 2: Create new activity */}
          <View style={styles.createSection}>
            <CdButton
              title="Create a new activity"
              onPress={handleCreateNew}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <CdButton
              title="Previous"
              onPress={goToPreviousStep}
              variant="outline"
              style={styles.navButton}
            />
          )}

          <View style={styles.navButtonSpacer} />
        </View>
      </View>
    );
  };

  const renderSummaryStep = () => {
    const createNewCount = activityMappings.filter(
      (m) => m.action === "create_new"
    ).length;
    const mapExistingCount = activityMappings.filter(
      (m) => m.action === "map_existing"
    ).length;

    return (
      <View style={[styles.stepContainer, { width: screenWidth }]}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Migration Summary</Text>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{createNewCount}</Text>
              <Text style={styles.statLabel}>New activities to create</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{mapExistingCount}</Text>
              <Text style={styles.statLabel}>
                Activities to map to existing
              </Text>
            </View>
          </View>

          <View style={styles.summaryList}>
            <Text style={styles.summaryListTitle}>Activity Mappings:</Text>

            {/* Header for two-column mapping */}
            <View style={styles.summaryMappingHeader}>
              <Text style={styles.mappingHeaderText}>v1 (Old)</Text>
              <Text style={styles.mappingHeaderText}>v2 (New / Existing)</Text>
            </View>

            <ScrollView
              style={styles.summaryScrollView}
              showsVerticalScrollIndicator={false}
            >
              {activityMappings.length === 0 && (
                <View style={styles.mappingPlaceholder}>
                  <Text style={styles.summaryItemDetail}>
                    No activities mapped yet. Go back to map or create new
                    activities.
                  </Text>
                </View>
              )}

              {activityMappings.map((mapping, index) => {
                const v1Activity = v1Activities.find(
                  (a) => a.activity_id === mapping.v1ActivityId
                );

                if (!v1Activity) return null;

                // v1 display
                const v1Display: Activity = {
                  id: v1Activity.activity_id,
                  name: v1Activity.custom_name || v1Activity.name,
                  color: v1Activity.custom_color || v1Activity.color,
                  weight: 0.5,
                  status: "ENABLED",
                  user_id: v1Activity.user_id,
                  activity_category_id: null,
                  parent_activity_id: null,
                };

                // v2 display (may be an existing v2 or a new one to create)
                let v2Display: Activity | null = null;

                if (mapping.action === "map_existing" && mapping.v2ActivityId) {
                  const found = v2Activities.find(
                    (a) => a.id === mapping.v2ActivityId
                  );
                  if (found) {
                    v2Display = {
                      id: found.id,
                      name: found.name,
                      color: found.color,
                      weight: 0.5,
                      status: "ENABLED",
                      // V2Activity doesn't include user_id in migration types
                      // preserve ownership from the v1 activity
                      user_id: v1Activity.user_id,
                      activity_category_id: null,
                      parent_activity_id: null,
                    };
                  }
                } else if (
                  mapping.action === "create_new" &&
                  mapping.updatedActivity
                ) {
                  const u = mapping.updatedActivity;
                  v2Display = {
                    id: u.activity_id,
                    name: u.name,
                    color: u.color,
                    weight: 0.5,
                    status: "ENABLED",
                    user_id: u.user_id,
                    activity_category_id: null,
                    parent_activity_id: null,
                  };
                }

                return (
                  <View
                    key={`${mapping.v1ActivityId}-${index}`}
                    style={styles.mappingRow}
                  >
                    {/* v1: color swatch + name */}
                    <View style={styles.mappingColumn}>
                      <View
                        style={[
                          styles.colorSwatch,
                          {
                            backgroundColor: v1Display.color ?? COLORS.primary,
                          },
                        ]}
                      />
                      <Text style={styles.mappingName} numberOfLines={1}>
                        {v1Display.name}
                      </Text>
                    </View>

                    {/* v2: color swatch + name (either mapped existing or new) */}
                    <View style={styles.mappingColumn}>
                      {v2Display ? (
                        <>
                          <View
                            style={[
                              styles.colorSwatch,
                              {
                                backgroundColor:
                                  v2Display.color ?? COLORS.primary,
                              },
                            ]}
                          />
                          <Text style={styles.mappingName} numberOfLines={1}>
                            {v2Display.name}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.summaryItemDetail}>
                          {mapping.action === "create_new"
                            ? "(new)"
                            : "(missing)"}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.summaryActions}>
            <CdButton
              title="Back to Review"
              onPress={goToPreviousStep}
              variant="outline"
              style={styles.summaryNavButton}
            />
            <CdButton
              title="Complete Migration"
              onPress={handleComplete}
              variant="primary"
              style={styles.summaryNavButton}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />
      <View style={styles.stepsWrapper}>
        {v1Activities.map((a, i) => renderActivityStep(a, i))}
        {renderSummaryStep()}
      </View>

      <View style={styles.footer}>
        <CdButton
          title="Cancel Migration"
          onPress={onCancel}
          variant="text"
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepsWrapper: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
    flex: 1,
  },
  activityCard: {
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  colorIndicator: {
    width: 80,
    height: 32,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  activityName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  createSection: {
    marginBottom: 16,
  },
  optionSection: {
    marginBottom: 24,
    width: "100%",
  },
  noActivitiesText: {
    fontSize: 14,
    color: COLORS.textIcons,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 20,
  },
  navButton: {
    minWidth: 120,
  },
  navButtonSpacer: {
    flex: 1,
  },
  summaryCard: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textIcons,
    textAlign: "center",
    marginTop: 4,
  },
  summaryList: {
    flex: 1,
    marginBottom: 24,
  },
  summaryListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  summaryScrollView: {
    flex: 1,
  },
  // removed legacy icon styles
  // Two-column mapping styles
  summaryMappingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  mappingHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  mappingPlaceholder: {
    padding: 12,
    alignItems: "center",
  },
  mappingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  mappingColumn: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  // simplified mapping item styles
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
  },
  mappingName: {
    fontSize: 14,
    color: "#fff",
    flexShrink: 1,
  },
  summaryItemDetail: {
    fontSize: 12,
    color: COLORS.textIcons,
    marginTop: 2,
  },
  summaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryNavButton: {
    flex: 1,
  },
  footer: {
    padding: 20,
  },
  cancelButton: {
    alignSelf: "center",
  },
  dropdown: {
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    marginBottom: 16,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  dropdownColorIndicator: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text.header,
  },
  dropdownItemDetail: {
    fontSize: 12,
    color: COLORS.textIcons,
    marginTop: 2,
  },
  mapButton: {
    alignSelf: "flex-start",
  },
  dropdownContainer: {
    width: "100%",
    alignSelf: "center",
  },
  placeholderStyle: {
    fontSize: 16,
    marginLeft: 8,
    color: COLORS.textIcons,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: COLORS.text.header,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: COLORS.text.header,
  },
  // (removed legacy unused styles)
});
