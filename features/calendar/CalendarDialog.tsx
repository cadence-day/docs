import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { locale } from "@/shared/locales";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type CalendarDialogHandle = {
  confirm: () => void;
};

export const CalendarDialog = forwardRef<
  CalendarDialogHandle,
  {
    selectedDate?: Date;
    onSelect?: (d: Date) => void;
    // optional confirm callback that DialogHost will call when Done is pressed
    confirm?: () => void;
    // optional headerProps to display custom title
    headerProps?: any;
    // internal: dialog id when rendered via DialogHost
    _dialogId?: string;
  }
>(({ selectedDate, onSelect, confirm, headerProps, _dialogId }, ref) => {
  const { t } = useTranslation();
  const strip = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = React.useMemo(() => strip(new Date()), []);

  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const d = selectedDate ?? new Date();
    const safe = strip(d) > today ? today : strip(d);
    return { year: safe.getFullYear(), month: safe.getMonth() };
  });
  const [temp, setTemp] = React.useState<Date>(() => {
    const d = selectedDate ?? new Date();
    return strip(d) > today ? today : strip(d);
  });

  React.useEffect(() => {
    if (selectedDate) {
      setTemp(selectedDate);
      setCurrentMonth({
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
      });
    }
  }, [selectedDate]);

  const pickDate = (d: Date) => {
    const s = strip(d);
    if (s > today) return; // don't allow future dates
    setTemp(s);
    onSelect?.(s);
  };

  // build weeks array (Monday-first) and group into rows of 7 for predictable layout
  const weeks = React.useMemo(() => {
    const arr: (Date | null)[] = [];
    const firstOfMonth = new Date(currentMonth.year, currentMonth.month, 1);
    const startWeekday = firstOfMonth.getDay();
    const offset = (startWeekday + 6) % 7; // Monday-first offset
    for (let i = 0; i < offset; i++) arr.push(null);
    const daysInMonth = new Date(
      currentMonth.year,
      currentMonth.month + 1,
      0
    ).getDate();
    for (let d = 1; d <= daysInMonth; d++)
      arr.push(new Date(currentMonth.year, currentMonth.month, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [currentMonth]);

  const rows = React.useMemo(() => {
    const r: (Date | null)[][] = [];
    for (let i = 0; i < weeks.length; i += 7) r.push(weeks.slice(i, i + 7));
    return r;
  }, [weeks]);

  // when picking a date via the dialog host, persist a temp selection in the
  // dialog store so the host's Done button can read it.
  React.useEffect(() => {
    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (_dialogId)
        useDialogStore
          .getState()
          .setDialogProps(_dialogId, { tempSelected: temp });
    } catch (e) {
      // ignore
    }
  }, [temp, _dialogId]);

  const handleConfirm = () => {
    onSelect?.(temp);
    confirm?.();
    try {
      const useDialogStore = require("@/shared/stores/useDialogStore").default;
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
    } catch (e) {
      // ignore
    }
  };

  useImperativeHandle(ref, () => ({
    confirm: handleConfirm,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            const prev = new Date(currentMonth.year, currentMonth.month - 1, 1);
            setCurrentMonth({
              year: prev.getFullYear(),
              month: prev.getMonth(),
            });
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </Pressable>

        <Text style={styles.title} accessibilityRole="header">
          {new Date(currentMonth.year, currentMonth.month).toLocaleString(
            locale,
            {
              month: "long",
              year: "numeric",
            }
          )}
        </Text>

        {(() => {
          const todayKey = today.getFullYear() * 12 + today.getMonth();
          const currentKey = currentMonth.year * 12 + currentMonth.month;
          const nextDisabled = currentKey >= todayKey;
          return (
            <Pressable
              onPress={() => {
                if (nextDisabled) return;
                const next = new Date(
                  currentMonth.year,
                  currentMonth.month + 1,
                  1
                );
                setCurrentMonth({
                  year: next.getFullYear(),
                  month: next.getMonth(),
                });
              }}
              disabled={nextDisabled}
              accessibilityState={{ disabled: nextDisabled }}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={nextDisabled ? "#666" : COLORS.primary}
              />
            </Pressable>
          );
        })()}
      </View>

      <View style={styles.shortcutsRow}>
        <Pressable
          onPress={() => {
            const t = new Date();
            const s = strip(t);
            setCurrentMonth({ year: s.getFullYear(), month: s.getMonth() });
            pickDate(s);
          }}
        >
          <Text style={styles.link}>{t("today")}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            pickDate(y);
          }}
        >
          <Text style={styles.link}>{t("yesterday")}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const y = new Date();
            y.setDate(y.getDate() - 2);
            pickDate(y);
          }}
        >
          <Text style={styles.link}>{t("calendarDialog.2-days")}</Text>
        </Pressable>
      </View>

      <View style={styles.calendarGrid}>
        <View style={styles.weekRow}>
          {[t("mo"), t("tu"), t("we"), t("th"), t("fr"), t("sa"), t("su")].map(
            (d) => (
              <View key={d} style={styles.weekdayLabel}>
                <Text style={styles.weekdayLabelText}>{d}</Text>
              </View>
            )
          )}
        </View>

        {rows.map((row, rIdx) => (
          <View key={rIdx} style={styles.weekRow}>
            {row.map((dt, idx) => {
              const isSelected =
                dt && temp.toDateString() === dt.toDateString();
              const isFuture = dt ? strip(dt) > today : false;
              return (
                <Pressable
                  key={idx}
                  onPress={() => dt && !isFuture && pickDate(dt)}
                  style={[
                    styles.dateCell,
                    isSelected && styles.dateCellSelected,
                    isFuture && styles.dateCellDisabled,
                  ]}
                >
                  <Text
                    style={
                      isFuture
                        ? styles.dateTextDisabled
                        : isSelected
                          ? styles.dateTextSelected
                          : styles.dateText
                    }
                  >
                    {dt ? dt.getDate() : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 20, alignItems: "center" },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#fff",
    textAlign: "center",
  },
  shortcuts: { flexDirection: "row", gap: 12 },
  shortcutsRow: { flexDirection: "row", gap: 24, marginBottom: 12 },
  link: {
    color: COLORS.primary,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  note: { marginTop: 12, color: "#666" },
  calendarGrid: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 6,
    justifyContent: "center",
    marginTop: 15,
  },
  weekRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekdayLabel: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  weekdayLabelText: {
    color: "#fff",
    textAlign: "center",
  },
  dateCell: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  dateCellSelected: { backgroundColor: COLORS.primary },
  dateCellDisabled: { opacity: 0.35 },
  dateText: { color: "#fff" },
  dateTextSelected: { color: "white", fontWeight: "700" },
  dateTextDisabled: { color: "#fff" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    width: "100%",
  },
  pickerButton: { color: COLORS.primary, fontSize: 20 },
  pickerButtonDisabled: { color: "#666" },
});

export default CalendarDialog;
