import { supabaseClient } from "@/shared/api/client";
import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;

  if (!isDev) {
    return (
      <View style={styles.container}>
        <Link href="/(home)">
          <Text style={styles.link}>Back to Home</Text>
        </Link>
        <Text style={styles.title}>Debug Screen (development only)</Text>
        <Text>
          This page is only available in development builds. Rebuild in dev to
          access debug tools.
        </Text>
      </View>
    );
  }
  const activityCategoriesState = useActivityCategoriesStore();
  const activitiesState = useActivitiesStore();
  const notesState = useNotesStore();
  const statesState = useStatesStore();
  const timeslicesState = useTimeslicesStore();

  const showSessionInfo = async () => {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      Alert.alert("Error fetching session", error.message);
      return;
    }

    if (session) {
      Alert.alert(
        "Supabase Session Details",
        `Access Token: \n${session.access_token} \n\nSession: \n${JSON.stringify(
          session,
          null,
          2
        )}`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("No active session found.");
    }
  };

  return (
    <View style={styles.container}>
      <Link href="/(home)">
        <Text style={styles.link}>Back to Home</Text>
      </Link>
      <Text style={styles.title}>Debug Screen</Text>
      <TouchableOpacity onPress={showSessionInfo} style={styles.button}>
        <Text style={styles.buttonText}>Show Supabase Session</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
