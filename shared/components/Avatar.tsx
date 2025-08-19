import { View, Image, Text } from "react-native";

const Avatar = ({ photo_url }: { photo_url: string | "" }) => {
  return (
    <View
      style={{
        width: "95%",
        height: "20%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "#6646EC",
        }}
      />
      <Image
        source={require("@/assets/images/Profile.png")}
        // source={{ uri: 'https://avatars.githubusercontent.com/u/3433606?v=4' }}
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 50,
        }}
      />

      <Text
        style={{
          position: "absolute",
          top: 140,
          fontSize: 10,
          color: "#575453",
          textAlign: "center",
          letterSpacing: 1.3,
          textTransform: "uppercase",
        }}
      >
        Edit profile photo
      </Text>
    </View>
  );
};

export default Avatar;
