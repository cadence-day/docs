import { styles } from "@/features/activity/styles";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type GridViewProps<T> = {
  items: T[];
  totalRows: number;
  columns: number;
  itemWidth: number | string;
  itemHeight: number;
  gridGap: number;
  dragPlaceholderIndex?: number | null;
  onAdd?: (() => void) | null;
  renderBackgroundCell?: (opts: {
    index: number;
    isPlaceholder: boolean;
    isAddPlaceholder: boolean;
    row: number;
    col: number;
  }) => React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  // Optional customization
  placeholderBorderColor?: string;
  placeholderBorderWidth?: number;
  renderAddPlaceholder?: (
    onPress: (() => void) | null,
    boxWidth?: number
  ) => React.ReactNode;
  accessibilityProps?: Record<string, any>;
  onCellPress?: (index: number, row: number, col: number) => void;
};

/**
 * Generic grid view which renders a background grid (placeholders, add box)
 * and an overlay of items (which may be draggable components provided by caller).
 */
export default function GridView<T>({
  items,
  totalRows,
  columns,
  itemWidth,
  itemHeight,
  gridGap,
  dragPlaceholderIndex,
  onAdd,
  renderBackgroundCell,
  renderItem,
  placeholderBorderColor,
  placeholderBorderWidth,
  renderAddPlaceholder,
  accessibilityProps,
  onCellPress,
}: GridViewProps<T>) {
  const totalCells = Math.max(1, totalRows * columns);

  return (
    <View {...(accessibilityProps || {})}>
      {/* Background grid */}
      <View style={localStyles.backgroundGrid}>
        {Array.from({ length: totalCells }).map((_, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;

          const isAddPlaceholder = index === 0 && !!onAdd;
          const isPlaceholder = dragPlaceholderIndex === index;

          let content: React.ReactNode = null;
          if (renderBackgroundCell) {
            content = renderBackgroundCell({
              index,
              isPlaceholder,
              isAddPlaceholder,
              row,
              col,
            });
          } else if (isAddPlaceholder && renderAddPlaceholder) {
            content = renderAddPlaceholder(onAdd, 80);
          }

          const CellWrapper: React.ComponentType<Record<string, unknown>> =
            onCellPress ? TouchableOpacity : View;

          return (
            <CellWrapper
              key={`grid-${row}-${col}`}
              onPress={
                onCellPress ? () => onCellPress(index, row, col) : undefined
              }
              style={[
                styles.gridCellWrapper,
                {
                  width: itemWidth as any,
                  height: itemHeight,
                  marginBottom: gridGap,
                },
                isPlaceholder && {
                  borderWidth: placeholderBorderWidth ?? 2,
                  borderColor: placeholderBorderColor ?? "#4CAF50",
                },
              ]}
            >
              {content}
            </CellWrapper>
          );
        })}
      </View>

      {/* Items overlay */}
      <View style={localStyles.itemsOverlay}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  backgroundGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    zIndex: 0,
    width: "100%",
  },
  itemsOverlay: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
});
