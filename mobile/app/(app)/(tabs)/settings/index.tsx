import { Alert, useColorScheme, View } from "react-native";
import React, { useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Divider } from "@rneui/themed";
import { getInitials } from "@/utils/helpers";
import { Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import ChangeProfileCamera from "@/components/ChangeProfileCamera";

const Settings = () => {
  const { logout, user, token, setUser } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["20%"], []);

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Success", "You have been logged out successfully.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View className="dark:bg-black flex-1  items-center p-4">
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <ChangeProfileCamera token={token} setUser={setUser} />
      </CustomBottomSheet>
      <View
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { height: 2, width: 2 },
          shadowRadius: 3,
          borderRadius: 10,
          elevation: 2,
        }}
        className="bg-neutral-100 dark:bg-neutral-900 mt-8 mb-5 w-full rounded-lg"
      >
        <View className="flex-row items-center space-x-5 m-4">
          <Avatar
            size={80}
            title={getInitials(
              user?.firstName as string,
              user?.lastName as string
            )}
            rounded
            containerStyle={{ backgroundColor: "dodgerblue" }}
            source={{ uri: user?.photoUrl }}
          />
          <View>
            <Text className="text-2xl dark:text-white font-medium">{`${user?.firstName} ${user?.lastName}`}</Text>
            <Text className="text-base dark:text-white">{`${user?.email}`}</Text>
          </View>
        </View>
        <Divider color={colorScheme === "dark" ? "#2b2b2b" : ""} />
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.present()}
          className="flex-row items-center space-x-4 px-4 py-2"
        >
          <MaterialCommunityIcons
            color={colorScheme === "dark" ? "white" : "black"}
            size={25}
            name="camera"
          />
          <Text className="text-base dark:text-white font-medium">
            Change profile picture
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { height: 2, width: 2 },
          shadowRadius: 3,
          borderRadius: 10,
          // backgroundColor: "#eee",
          elevation: 2,
        }}
        className="bg-neutral-100 dark:bg-neutral-900 w-full rounded-lg"
      >
        <TouchableOpacity
          onPress={() => router.push("/settings/account-details")}
          className="flex-row  justify-between items-center space-x-5 px-4 py-2 "
        >
          <View className="flex-row  justify-between  items-center space-x-5">
            <FontAwesome6
              color={colorScheme === "dark" ? "white" : "black"}
              size={20}
              name="user-large"
            />
            <Text className="text-base dark:text-white font-medium">
              Account
            </Text>
          </View>
          <MaterialCommunityIcons
            color={colorScheme === "dark" ? "white" : "black"}
            size={25}
            name="chevron-right"
          />
        </TouchableOpacity>
        <Divider inset color={colorScheme === "dark" ? "#2b2b2b" : ""} />
        <TouchableOpacity
          onPress={() => router.push("/settings/change-password")}
          className="flex-row  justify-between items-center space-x-5 px-4 py-2"
        >
          <View className="flex-row  justify-between  items-center space-x-5">
            <FontAwesome6
              color={colorScheme === "dark" ? "white" : "black"}
              size={20}
              name="key"
            />
            <Text className="text-base dark:text-white font-medium">
              Change password
            </Text>
          </View>
          <MaterialCommunityIcons
            color={colorScheme === "dark" ? "white" : "black"}
            size={25}
            name="chevron-right"
          />
        </TouchableOpacity>
        <Divider inset color={colorScheme === "dark" ? "#2b2b2b" : ""} />
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row  justify-between items-center space-x-5 px-4 py-2"
        >
          <View className="flex-row  justify-between  items-center space-x-5">
            <MaterialCommunityIcons
              color={colorScheme === "dark" ? "white" : "black"}
              size={20}
              name="exit-to-app"
            />
            <Text className="text-base dark:text-white font-medium">
              logout
            </Text>
          </View>
          <MaterialCommunityIcons
            color={colorScheme === "dark" ? "white" : "black"}
            size={25}
            name="chevron-right"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Settings;
