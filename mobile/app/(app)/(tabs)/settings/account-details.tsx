import { View, Text, FlatList } from "react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";

const AccountDetails = () => {
  const { user } = useAuth();
  return (
    <View className="w-full h-full px-4">
      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">
          First Name
        </Text>
        <View className="h-10 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-green-500">
            {user?.firstName.toUpperCase() || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">
          Last Name
        </Text>
        <View className="h-10 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-green-500">
            {user?.lastName.toUpperCase() || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">
          Email
        </Text>
        <View className="h-10 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-green-500">
            {user?.email.toUpperCase() || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">Role</Text>
        <View className="h-10 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-green-500">
            {user?.role.toUpperCase() || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">
          Department
        </Text>
        <View className="h-10 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-green-500">
            {user?.department.name.toUpperCase() || "N/A"}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Text className="dark:text-white text-base font-medium mb-1">
          Courses
        </Text>
        <View className="p-3 h-[100px]  flex justify-center rounded-xl">
          <FlatList
            data={user?.courses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Text className="text-green-500">{item.name}</Text>
            )}
            ListEmptyComponent={() => (
              <Text className="text-gray-500">No courses available</Text>
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default AccountDetails;
