import React from "react";
import { View } from "react-native";
import { CdText } from "@/shared/components/CadenceUI";
import { ProfileImagePicker } from "../components/ProfileImagePicker";
import useDialogStore from "@/shared/stores/useDialogStore";

type Props = {
  _dialogId?: string;
  currentImageUrl?: string | null;
  onImageSelected?: (url: string) => void;
};

const ProfileImagePickerDialog: React.FC<Props> = ({ _dialogId, currentImageUrl, onImageSelected }) => {
  const close = () => {
    if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
  };

  return (
    <View style={{ gap: 10 }}>
      <CdText variant="body" size="medium">Select a new profile photo</CdText>
      <ProfileImagePicker
        currentImageUrl={currentImageUrl || undefined}
        onPick={(url) => {
          onImageSelected?.(url);
          close();
        }}
      />
    </View>
  );
};

export default ProfileImagePickerDialog;

