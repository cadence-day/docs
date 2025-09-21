import SageIcon from "@/shared/components/icons/SageIcon";
import { useNotifications } from "@/shared/notifications";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import * as WebBrowser from "expo-web-browser";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { GlobalErrorHandler } from "../../../shared/utils/errorHandler";

export type OnboardingDialogHandle = {
  confirm: () => void;
};

interface PageProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
  linkText?: {
    text: string;
    onPress: () => void;
  };
  footer?: string;
}

const OnboardingIcon: React.FC = () => (
  <Svg width="70" height="78" viewBox="0 0 70 78" fill="none">
    <Rect
      x="17.2436"
      y="1.39258"
      width="16.8989"
      height="75.5157"
      rx="1.5"
      stroke="#6646EC"
    />
    <Rect
      x="34.5482"
      y="1.39258"
      width="17.2729"
      height="75.5157"
      rx="1.5"
      stroke="#6646EC"
    />
    <Rect
      x="52.2271"
      y="1.39258"
      width="17.2729"
      height="75.5157"
      rx="1.5"
      stroke="#6646EC"
    />
    <Rect
      x="0.5"
      y="1.39258"
      width="16.3377"
      height="75.5157"
      rx="1.5"
      stroke="#6646EC"
    />
  </Svg>
);

export const OnboardingDialog = forwardRef<
  OnboardingDialogHandle,
  {
    // optional confirm callback that DialogHost will call when Done is pressed
    confirm?: () => void;
    // optional headerProps to display custom title
    headerProps?: any;
    // internal: dialog id when rendered via DialogHost
    _dialogId?: string;
  }
>(({ confirm, headerProps, _dialogId }, ref) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { requestPermissions, updatePreferences } = useNotifications();

  const handleConfirm = () => {
    // Persist that onboarding was shown to avoid re-prompting
    try {
      userOnboardingStorage.setShown(true).catch(() => {
        /* non-fatal */
      });
    } catch (e) {
      /* ignore */
    }

    confirm?.();
    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
    } catch (e) {
      // ignore
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const result = await requestPermissions();
      // If permissions granted, set up default Cadence preferences
      if (result.granted) {
        await updatePreferences({
          rhythm: "both",
          middayTime: "12:00",
          eveningTimeStart: "20:00",
          eveningTimeEnd: "21:00",
          streaksEnabled: true,
          lightTouch: true,
        });
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        "Error setting up notifications in onboarding",
        "ONBOARDING_NOTIFICATION_ERROR",
        { error }
      );
    }
  };

  const handlePrivacyPolicy = async () => {
    await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/privacy", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  // Store the current page in dialog props so DialogHost can read it
  React.useEffect(() => {
    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (_dialogId)
        useDialogStore.getState().setDialogProps(_dialogId, { currentPage });
    } catch (e) {
      // ignore
    }
  }, [currentPage, _dialogId]);

  useImperativeHandle(ref, () => ({
    confirm: handleConfirm,
  }));

  const pages: PageProps[] = [
    {
      title: "Welcome to Cadence",
      content:
        "Time moves fast—Cadence helps you see it more clearly. Record your moments, reflect on your rhythms, and discover patterns that shape your days. No pressure, no perfection—just awareness.",
      icon: <OnboardingIcon />,
    },
    {
      title: "Expand Your Memory ",
      content:
        "Ever wonder what you did last Tuesday? Or what thoughts you had during a quiet morning? Notes help you hold onto the moments that matter—big or small, deep or fleeting.",
    },
    {
      title: "Stay in sync\nwith your time",
      content:
        "Turn on notifications for gentle reminders to log your activities throughout the day. No pressure, just a daily nudge to help you stay aware of your time.\n\n✨ Your future self will thank you. Take a moment to log your day.",
      actionButton: {
        text: "Allow notifications",
        onPress: handleNotificationPermission,
      },
    },
    {
      title: "Meet Sage",
      content:
        "Sage your friendly AI guide will help you notice the patterns in your time.\n\nAsk Sage to summarize your day, help you remember your goals, or notice your time patterns. The more you log, the more Sage can help.",
      icon: (
        <View
          style={{
            width: 100,
            height: 100,
            paddingBottom: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SageIcon status="pulsating" size={90} />
        </View>
      ),
    },
    {
      title: "Your Data,\nYour Privacy",
      content:
        "Your time is yours alone. Everything you log is encrypted and stored securely. No ads, no tracking, no sharing your information—just a safe space for self-reflection.",
      linkText: {
        text: "Read more about how we protect your privacy →",
        onPress: () => handlePrivacyPolicy(),
      },
    },
    {
      title: "Make Cadence Yours",
      content:
        "Cadence starts with universal activities—work, rest, movement—but life is more than categories. Love bird gazing? Add custom activities that make your rhythm uniquely yours.",
    },
  ];

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {pages[currentPage].icon && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              top: "14%",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {pages[currentPage].icon}
          </View>
        )}
        <Text style={styles.title}>{pages[currentPage].title}</Text>
        <Text style={styles.content}>{pages[currentPage].content}</Text>

        {pages[currentPage].linkText && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={pages[currentPage].linkText.onPress}
          >
            <Text style={styles.linkText}>
              {pages[currentPage].linkText.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {pages[currentPage].actionButton && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={pages[currentPage].actionButton.onPress}
        >
          <Text style={styles.actionButtonText}>
            {pages[currentPage].actionButton.text}
          </Text>
        </TouchableOpacity>
      )}

      {pages[currentPage].footer && (
        <Text style={styles.footerText}>{pages[currentPage].footer}</Text>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          if (currentPage < pages.length - 1) {
            goToPage(currentPage + 1);
          } else {
            handleConfirm();
          }
        }}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.pageIndicatorContainer}>
        {pages.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => goToPage(index)}>
            <View
              style={[
                styles.pageIndicator,
                currentPage === index && styles.pageIndicatorActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    width: "100%",
    padding: 20,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    width: 300,
    alignItems: "center",
    // Center content vertically when there's no icon
    justifyContent: "center",
  },
  content: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.9,
  },
  actionButton: {
    // marginTop:'40%',
    paddingVertical: 8,
    width: 300,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  linkButton: {
    marginTop: 62,
    width: 200,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  pageIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#727272",
    marginHorizontal: 4,
  },
  pageIndicatorActive: {
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default OnboardingDialog;
