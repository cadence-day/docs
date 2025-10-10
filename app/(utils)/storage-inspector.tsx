import { CdButton, CdText } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useNotificationsStore from "@/shared/stores/resources/useNotificationsStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import useSelectionStore from "@/shared/stores/ui/useSelectionStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import { Logger } from "@/shared/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface StorageItem {
  key: string;
  value: string;
  parsedValue?: unknown;
}

export default function StorageInspector() {
  const router = useRouter();
  const theme = useTheme();
  const [asyncStorageItems, setAsyncStorageItems] = useState<StorageItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Get Zustand store states
  const activitiesStore = useActivitiesStore();
  const activityCategoriesStore = useActivityCategoriesStore();
  const notesStore = useNotesStore();
  const notificationsStore = useNotificationsStore();
  const statesStore = useStatesStore();
  const timeslicesStore = useTimeslicesStore();
  const dialogStore = useDialogStore();
  const selectionStore = useSelectionStore();

  const loadAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);

      const storageItems: StorageItem[] = items.map(([key, value]) => {
        let parsedValue;
        try {
          parsedValue = value ? JSON.parse(value) : null;
        } catch {
          parsedValue = value;
        }
        return {
          key,
          value: value || "",
          parsedValue,
        };
      });

      // Sort by key
      storageItems.sort((a, b) => a.key.localeCompare(b.key));

      setAsyncStorageItems(storageItems);
    } catch (error) {
      Logger.logError(error, "Failed to load AsyncStorage items");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAsyncStorage();
    setRefreshing(false);
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const clearAllStorage = async () => {
    try {
      await AsyncStorage.clear();
      await loadAsyncStorage();
      Logger.logDebug("Cleared all AsyncStorage", "STORAGE_INSPECTOR");
    } catch (error) {
      Logger.logError(error, "Failed to clear AsyncStorage");
    }
  };

  useEffect(() => {
    loadAsyncStorage();
  }, []);

  const renderValue = (value: unknown, depth = 0): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);

    if (Array.isArray(value)) {
      if (depth > 2) return `[Array(${value.length})]`;
      return `[${value.length} items]`;
    }

    if (typeof value === "object") {
      if (depth > 2) return "[Object]";
      const keys = Object.keys(value);
      return `{${keys.length} keys}`;
    }

    return String(value);
  };

  const formatJson = (value: unknown): string => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const zustandStores = [
    { name: "Activities", data: activitiesStore },
    { name: "Activity Categories", data: activityCategoriesStore },
    { name: "Notes", data: notesStore },
    { name: "Notifications", data: notificationsStore },
    { name: "States", data: statesStore },
    { name: "Timeslices", data: timeslicesStore },
    { name: "Dialogs", data: dialogStore },
    { name: "Selection", data: selectionStore },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <View
        style={[styles.header, { backgroundColor: theme.background.secondary }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <CdText
            variant="body"
            size="medium"
            style={{ color: theme.text.primary }}
          >
            ← Back
          </CdText>
        </TouchableOpacity>
        <CdText variant="title" size="large" style={styles.title}>
          Storage Inspector
        </CdText>
        <View style={styles.headerActions}>
          <CdButton
            title="Clear All"
            onPress={clearAllStorage}
            variant="outline"
            size="small"
            style={styles.clearButton}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* AsyncStorage Section */}
        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            AsyncStorage ({asyncStorageItems.length} items)
          </CdText>
          {asyncStorageItems.length === 0 ? (
            <CdText variant="body" size="small" style={styles.emptyText}>
              No items in AsyncStorage
            </CdText>
          ) : (
            asyncStorageItems.map((item) => {
              const isExpanded = expandedKeys.has(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.storageItem,
                    { backgroundColor: theme.background.secondary },
                  ]}
                  onPress={() => toggleExpand(item.key)}
                >
                  <View style={styles.storageItemHeader}>
                    <CdText
                      variant="body"
                      size="small"
                      style={{
                        ...styles.storageKey,
                        color: theme.text.primary,
                      }}
                      numberOfLines={1}
                    >
                      {item.key}
                    </CdText>
                    <CdText
                      variant="body"
                      size="small"
                      style={{ color: theme.text.secondary }}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </CdText>
                  </View>
                  {!isExpanded && (
                    <CdText
                      variant="body"
                      size="small"
                      style={{
                        ...styles.storageValue,
                        color: theme.text.secondary,
                      }}
                      numberOfLines={1}
                    >
                      {renderValue(item.parsedValue)}
                    </CdText>
                  )}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <CdText
                        variant="body"
                        size="small"
                        style={{
                          ...styles.jsonText,
                          color: theme.text.secondary,
                        }}
                      >
                        {formatJson(item.parsedValue)}
                      </CdText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Zustand Stores Section */}
        <View style={styles.section}>
          <CdText variant="title" size="medium" style={styles.sectionTitle}>
            Zustand Stores
          </CdText>
          {zustandStores.map((store) => {
            const storeKey = `zustand_${store.name}`;
            const isExpanded = expandedKeys.has(storeKey);
            return (
              <TouchableOpacity
                key={storeKey}
                style={[
                  styles.storageItem,
                  { backgroundColor: theme.background.secondary },
                ]}
                onPress={() => toggleExpand(storeKey)}
              >
                <View style={styles.storageItemHeader}>
                  <CdText
                    variant="body"
                    size="small"
                    style={{
                      ...styles.storageKey,
                      color: theme.text.primary,
                    }}
                  >
                    {store.name}
                  </CdText>
                  <CdText
                    variant="body"
                    size="small"
                    style={{ color: theme.text.secondary }}
                  >
                    {isExpanded ? "▼" : "▶"}
                  </CdText>
                </View>
                {!isExpanded && (
                  <CdText
                    variant="body"
                    size="small"
                    style={{
                      ...styles.storageValue,
                      color: theme.text.secondary,
                    }}
                    numberOfLines={1}
                  >
                    {renderValue(store.data, 0)}
                  </CdText>
                )}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <CdText
                      variant="body"
                      size="small"
                      style={{
                        ...styles.jsonText,
                        color: theme.text.secondary,
                      }}
                    >
                      {formatJson(store.data)}
                    </CdText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.ui.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  emptyText: {
    fontStyle: "italic",
    opacity: 0.6,
    textAlign: "center",
    paddingVertical: 20,
  },
  storageItem: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.ui.border,
  },
  storageItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  storageKey: {
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  storageValue: {
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 11,
  },
});
