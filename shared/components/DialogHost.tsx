import { CdDialog } from "@/shared/components/CadenceUI/CdDialog";
import { NAV_BAR_SIZE } from "@/shared/constants/VIEWPORT";
import { DialogRegistry } from "@/shared/dialogs/registry";
import useDialogStore from "@/shared/stores/useDialogStore";
import React from "react";
import { StyleSheet, View } from "react-native";

export const DialogHost: React.FC = () => {
  const dialogs = useDialogStore((s) => s.dialogs);

  const ordered = Object.values(dialogs).sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {ordered.map((d) => {
        const Component = DialogRegistry[d.type];
        return (
          <CdDialog
            key={d.id}
            visible={true}
            onClose={() => useDialogStore.getState().closeDialog(d.id)}
            headerProps={{ title: d.type }}
            height={50}
            enableDragging
          >
            {Component ? <Component {...(d.props ?? {})} /> : null}
          </CdDialog>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: NAV_BAR_SIZE,
    zIndex: 2000,
    pointerEvents: "box-none",
  },
});

export default DialogHost;
