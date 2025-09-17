import { CdDialog } from "@/shared/components/CadenceUI/CdDialog";
import { DialogRegistry } from "@/shared/dialogs/registry";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import React from "react";
import { StyleSheet, View } from "react-native";

export const DialogHost: React.FC = () => {
  const { t } = useTranslation();
  const dialogs = useDialogStore((s) => s.dialogs);

  const ordered = Object.values(dialogs).sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );
  return (
    <View pointerEvents="box-none" style={styles.host}>
      {ordered.map((d) => {
        const Component = DialogRegistry[d.type];
        const headerProps = d.props?.headerProps ?? { title: d.type };
        // If dialog is collapsed, render a minimal header-only height (about 12%)
        const height = d.collapsed
          ? (d.props?.height ?? 10)
          : (d.props?.height ?? 40);
        const maxHeight = d.props?.maxHeight ?? 100;
        return (
          <CdDialog
            key={d.id}
            visible={true}
            collapsed={d.collapsed}
            onClose={() => useDialogStore.getState().closeDialog(d.id)}
            headerProps={{
              ...headerProps,
              rightActionElement:
                headerProps.rightActionElement ?? t("common.done"),
              onRightAction:
                headerProps.onRightAction ||
                (() => {
                  try {
                    const props =
                      useDialogStore.getState().getDialog(d.id)?.props ?? {};
                    if (typeof props.onConfirm === "function")
                      props.onConfirm();
                  } catch (e) {
                    // ignore
                  }
                  useDialogStore.getState().closeDialog(d.id);
                }),
              // Support for back action
              backAction: !!headerProps.onLeftAction,
              onBackAction: headerProps.onLeftAction,
            }}
            height={height}
            maxHeight={maxHeight}
            // Allow dialogs to opt-out of dragging via props, but default to
            // enabling dragging even when a dialog is initially collapsed so
            // the user can pull it up (useful for activity dialog on Today).
            enableDragging={d.props?.enableDragging ?? true}
          >
            {Component ? (
              <Component {...(d.props ?? {})} _dialogId={d.id} />
            ) : null}
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
    bottom: 0,
    zIndex: 2000,
    pointerEvents: "box-none",
  },
});

export default DialogHost;
