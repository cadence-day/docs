import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StoreStateDisplay = ({
  storeName,
  storeData,
}: {
  storeName: string;
  storeData: object;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.storeContainer}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.storeHeader}
      >
        <Text style={styles.storeName}>{storeName}</Text>
        <Text>{isOpen ? "▼" : "▶"}</Text>
      </TouchableOpacity>
      {isOpen && (
        <Text style={styles.storeData}>
          {JSON.stringify(storeData, null, 2)}
        </Text>
      )}
    </View>
  );
};

const DebugScreen = () => {
  const activityCategoriesState = useActivityCategoriesStore();
  const activitiesState = useActivitiesStore();
  const notesState = useNotesStore();
  const statesState = useStatesStore();
  const timeslicesState = useTimeslicesStore();

  return (
    <View style={styles.container}>
      <Link href="/(home)">
        <Text style={styles.link}>Back to Home</Text>
      </Link>
      <Text style={styles.title}>Debug Screen</Text>
      <ScrollView style={styles.scrollView}>
        <StoreStateDisplay
          storeName="useActivityCategoriesStore"
          storeData={activityCategoriesState}
        />
        <StoreStateDisplay
          storeName="useActivitiesStore"
          storeData={activitiesState}
        />
        <StoreStateDisplay storeName="useNotesStore" storeData={notesState} />
        <StoreStateDisplay storeName="useStatesStore" storeData={statesState} />
        <StoreStateDisplay
          storeName="useTimeslicesStore"
          storeData={timeslicesState}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  link: {
    fontSize: 16,
    color: "blue",
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  storeContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  storeData: {
    padding: 12,
    backgroundColor: "#fafafa",
  },
});

export default DebugScreen;
