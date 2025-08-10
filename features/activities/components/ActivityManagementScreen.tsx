import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";
import useActivityCategoriesStore from "@/shared/stores/useActivityCategoriesStore";
import type { Activity, ActivityCategory } from "@/shared/types/models";
import { useUser } from "@clerk/clerk-expo";

interface ActivityWithCategory extends Activity {
  category?: ActivityCategory;
}

export default function ActivityManagementScreen() {
  // Store state
  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    insertActivity,
    refresh: refreshActivities,
    softDeleteActivity,
    disableActivity,
    updateActivity,
  } = useActivitiesStore();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  } = useActivityCategoriesStore();

  // Local state for form
  const [activityName, setActivityName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const { isLoaded, user } = useUser();

  const userId = user?.id;

  // Load data on mount
  useEffect(() => {
    refreshCategories();
    refreshActivities();
  }, [refreshCategories, refreshActivities]);

  // Helper function to get activities with category info
  const getActivitiesWithCategories = (): ActivityWithCategory[] => {
    return activities.map((activity) => ({
      ...activity,
      category: categories.find(
        (cat) => cat.id === activity.activity_category_id
      ),
    }));
  };

  const handleCreateActivity = async () => {
    if (!activityName.trim()) {
      Alert.alert("Error", "Please enter an activity name");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsCreating(true);
    try {
      const newActivity = await insertActivity({
        name: activityName.trim(),
        status: "ENABLED",
        activity_category_id: selectedCategoryId || null,
        user_id: userId, // Replace with actual user ID
        color: "#000000",
        parent_activity_id: null,
        weight: 1,
      });

      if (newActivity) {
        setActivityName("");
        setSelectedCategoryId("");
        Alert.alert("Success", "Activity created successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create activity");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteActivity = (activity: Activity) => {
    Alert.alert(
      "Delete Activity",
      `Are you sure you want to delete "${activity.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => softDeleteActivity(activity.id!),
        },
      ]
    );
  };

  const handleToggleActivity = async (activity: Activity) => {
    if (activity.status === "ENABLED") {
      await disableActivity(activity.id!);
    } else {
      await updateActivity({ ...activity, status: "ENABLED" });
    }
  };

  const renderCategoryPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category (Optional)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategoryId && styles.categoryChipSelected,
          ]}
          onPress={() => setSelectedCategoryId("")}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategoryId && styles.categoryChipTextSelected,
            ]}
          >
            None
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategoryId === category.id && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategoryId(category.id!)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategoryId === category.id &&
                  styles.categoryChipTextSelected,
              ]}
            >
              {category.key}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActivityItem = ({ item }: { item: ActivityWithCategory }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        {item.category && (
          <Text style={styles.activityCategory}>{item.category.key}</Text>
        )}
        <Text
          style={[
            styles.activityStatus,
            { color: item.status === "ENABLED" ? "#22c55e" : "#ef4444" },
          ]}
        >
          {item.status}
        </Text>
      </View>

      <View style={styles.activityActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleActivity(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.status === "ENABLED" ? "Disable" : "Enable"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteActivity(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const isLoading = activitiesLoading || categoriesLoading;
  const hasError = activitiesError || categoriesError;
  const activitiesWithCategories = getActivitiesWithCategories();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Management</Text>

      {/* Error Display */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {activitiesError || categoriesError}
          </Text>
        </View>
      )}

      {/* Create Activity Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Create New Activity</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Activity Name</Text>
          <TextInput
            style={styles.textInput}
            value={activityName}
            onChangeText={setActivityName}
            placeholder="Enter activity name"
            editable={!isCreating}
          />
        </View>

        {categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text>Loading categories...</Text>
          </View>
        ) : categoriesError ? (
          <Text style={styles.errorText}>Error loading categories</Text>
        ) : (
          renderCategoryPicker()
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            (isCreating || !activityName.trim()) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateActivity}
          disabled={isCreating || !activityName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Activity</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Activities List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            Activities ({activitiesWithCategories.length})
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshActivities}
            disabled={activitiesLoading}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {activitiesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Loading activities...</Text>
          </View>
        ) : (
          <FlatList
            data={activitiesWithCategories}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id!}
            style={styles.activitiesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No activities found</Text>
                <Text style={styles.emptySubtext}>
                  Create your first activity above
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  categoryScrollView: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: "#10b981",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  activitiesList: {
    flex: 1,
  },
  activityItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  activityCategory: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  activityActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
