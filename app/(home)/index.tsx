import { SignedIn } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import Timeline from "@/features/timeline/Timeline";
import SageIcon from "@/shared/components/icons/SageIcon";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { NAV_BAR_SIZE } from "@/shared/constants/VIEWPORT";
import { ActivityLegend } from "@/shared/dialogs/registry";
import { useDateTimePreferences } from "@/shared/hooks/useDateTimePreferences";
import { Activity, Timeslice } from "@/shared/types/models";
import { formatDateWithWeekday } from "@/shared/utils/datetime";
// activityLegend hook isn't present in this path in the repo; use a simple local
// fallback. If you have a specific hook, we can wire it later.
const useActivityLegend = () => ({ isVisible: false, hide: () => {} });
// Provide tiny fallbacks if these shared components don't exist in the repo.
const ErrorBoundary: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
const LoadingScreen: React.FC = () => <></>;

// Stores
import { useActivitiesStore, useTimeslicesStore } from "@/shared/stores";

import { useI18n } from "@/shared/hooks/useI18n";
import useActivityCategoriesStore from "@/shared/stores/resources/useActivityCategoriesStore";
import { useToast } from "@/shared/hooks";

export default function Today() {
  const { t } = useI18n();
  const router = useRouter();
  const dateTimePreferences = useDateTimePreferences();
  const activityLegend = useActivityLegend();

  const activityCategories = useActivityCategoriesStore(
    (state) => state.categories
  );

  const { showInfo } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [shareModalVisible, setShareModalVisible] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SignedIn>
      <LinearGradient
        colors={[
          backgroundLinearColors.primary.end,
          backgroundLinearColors.primary.end,
        ]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, paddingBottom: NAV_BAR_SIZE + 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "transparent",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, color: "#222" }}>
                {t("home.title")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 0,
                  paddingVertical: 4,
                  marginTop: 2,
                }}
              >
                <Text style={{ fontSize: 14, color: "#444" }}>
                  {formatDateWithWeekday(
                    currentTime.toISOString(),
                    dateTimePreferences,
                    {
                      weekdayFormat: "long",
                      weekdayPosition: "before",
                      includeTime: true,
                      dateTimeSeparator: " at ",
                    }
                  )}
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => showInfo(t("sage.unavailableMessage"))}
              >
                <SageIcon size={40} status={"pulsating"} auto={false} />
              </TouchableOpacity>
            </View>
          </View>

          <ErrorBoundary>
            <Timeline />
          </ErrorBoundary>

          {/* Share modal could be added here when available */}
        </SafeAreaView>
      </LinearGradient>
    </SignedIn>
  );
}
