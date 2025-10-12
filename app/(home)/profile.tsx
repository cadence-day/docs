import React from "react";

const ProfileScreen = React.lazy(
  () => import("@/features/profile/components/ProfileScreen")
);

export default function ProfileRoute() {
  return <ProfileScreen />;
}
