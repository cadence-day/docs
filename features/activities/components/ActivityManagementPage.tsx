import { useEffect, useState } from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";
import useActivityCategoriesStore from "@/shared/stores/useActivityCategoriesStore";
import type { Activity, ActivityCategory } from "@/shared/types/models";

interface ActivityWithCategory extends Activity {
  category?: ActivityCategory;
}

export default function ActivityManagementPage() {
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

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityName.trim()) {
      alert("Please enter an activity name");
      return;
    }

    setIsCreating(true);
    try {
      const newActivity = await insertActivity({
        name: activityName.trim(),
        status: "ENABLED",
        activity_category_id: selectedCategoryId || null,
        user_id: "current-user-id", // Replace with actual user ID
        color: null,
        parent_activity_id: null,
        weight: null,
      });

      if (newActivity) {
        setActivityName("");
        setSelectedCategoryId("");
        alert("Activity created successfully!");
      }
    } catch (error) {
      alert("Failed to create activity");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm(`Are you sure you want to delete "${activity.name}"?`)) {
      softDeleteActivity(activity.id!);
    }
  };

  const handleToggleActivity = async (activity: Activity) => {
    if (activity.status === "ENABLED") {
      await disableActivity(activity.id!);
    } else {
      await updateActivity({ ...activity, status: "ENABLED" });
    }
  };

  const isLoading = activitiesLoading || categoriesLoading;
  const hasError = activitiesError || categoriesError;
  const activitiesWithCategories = getActivitiesWithCategories();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Activity Management
      </h1>

      {/* Error Display */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{activitiesError || categoriesError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Activity Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Create New Activity
          </h2>

          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div>
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Activity Name
              </label>
              <input
                id="activityName"
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Enter activity name"
                disabled={isCreating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category (Optional)
              </label>

              {categoriesLoading ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-500">
                    Loading categories...
                  </span>
                </div>
              ) : categoriesError ? (
                <p className="text-red-600 text-sm">Error loading categories</p>
              ) : (
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={isCreating}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id!}>
                      {category.key}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreating || !activityName.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Activity</span>
              )}
            </button>
          </form>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {activitiesWithCategories.length}
              </div>
              <div className="text-sm text-blue-600">Total Activities</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {
                  activitiesWithCategories.filter((a) => a.status === "ENABLED")
                    .length
                }
              </div>
              <div className="text-sm text-green-600">Active</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {
                  activitiesWithCategories.filter(
                    (a) => a.status === "DISABLED"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Disabled</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length}
              </div>
              <div className="text-sm text-purple-600">Categories</div>
            </div>
          </div>

          <button
            onClick={refreshActivities}
            disabled={activitiesLoading}
            className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Activities ({activitiesWithCategories.length})
          </h2>
        </div>

        <div className="p-6">
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading activities...</span>
            </div>
          ) : activitiesWithCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No activities found</p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first activity above
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activitiesWithCategories.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {activity.name}
                      </h3>
                      {activity.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.category.key}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === "ENABLED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActivity(activity)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        activity.status === "ENABLED"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {activity.status === "ENABLED" ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => handleDeleteActivity(activity)}
                      className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
