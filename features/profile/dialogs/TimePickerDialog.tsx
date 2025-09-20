import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { CdDialog } from "@/shared/components/CadenceUI";
import useDialogStore from "@/shared/stores/useDialogStore";
import useI18n from "@/shared/hooks/useI18n";
import { profileStyles } from "../styles";
import { TimePickerProps } from "../types";
import { PersonaService } from "../services/PersonaService";

interface TimePickerDialogProps extends TimePickerProps {
  _dialogId?: string;
}

export const TimePickerDialog: React.FC<TimePickerDialogProps> = ({
  mode,
  currentTime,
  onTimeChange,
  _dialogId,
}) => {
  const { t } = useI18n();
  const closeDialog = useDialogStore((s) => s.closeDialog);

  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

  // Parse current time on component mount
  useEffect(() => {
    if (currentTime) {
      const [time, period] = currentTime.split(" ");
      const [hourStr, minuteStr] = time.split(":");

      setSelectedHour(parseInt(hourStr));
      setSelectedMinute(parseInt(minuteStr));
      setSelectedPeriod((period as "AM" | "PM") || "AM");
    }
  }, [currentTime]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"];

  const handleConfirm = () => {
    const formattedTime = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")} ${selectedPeriod}`;

    // For now, we'll skip validation since we're focusing on the UI
    // TODO: Add validation with PersonaService in future iteration
    onTimeChange(formattedTime);

    if (_dialogId) {
      closeDialog(_dialogId);
    }
  };

  const renderScrollPicker = (
    items: (number | string)[],
    selectedValue: number | string,
    onValueChange: (value: any) => void,
    formatValue?: (value: any) => string
  ) => (
    <View style={profileStyles.timeColumn}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 80 }}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={{
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor:
                item === selectedValue ? "#E3F2FD" : "transparent",
              borderRadius: 8,
              marginVertical: 2,
            }}
            onPress={() => onValueChange(item)}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: item === selectedValue ? "600" : "400",
                color: item === selectedValue ? "#1976D2" : "#666",
              }}
            >
              {formatValue ? formatValue(item) : item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={profileStyles.timePickerContainer}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          {mode === "wake"
            ? t("profile.set-wake-time")
            : t("profile.set-sleep-time")}
        </Text>
        <Text style={{ fontSize: 16, color: "#666" }}>
          {`${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")} ${selectedPeriod}`}
        </Text>
      </View>

      <View style={profileStyles.timePickerWheel}>
        {renderScrollPicker(hours, selectedHour, setSelectedHour, (hour) =>
          hour.toString().padStart(2, "0")
        )}

        <View style={profileStyles.timeColumnSeparator}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>:</Text>
        </View>

        {renderScrollPicker(
          minutes,
          selectedMinute,
          setSelectedMinute,
          (minute) => minute.toString().padStart(2, "0")
        )}

        <View style={profileStyles.timeColumnSeparator} />

        {renderScrollPicker(periods, selectedPeriod, setSelectedPeriod)}
      </View>

      <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
        <TouchableOpacity
          style={profileStyles.upgradeButton}
          onPress={handleConfirm}
        >
          <Text style={profileStyles.upgradeButtonText}>
            {t("common.confirm")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
