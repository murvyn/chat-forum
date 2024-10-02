import { View, Text, useColorScheme } from "react-native";
import React from "react";
import { Avatar, Divider } from "@rneui/themed";
import AppButton from "./AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PostCard = ({
  name,
  createdAt,
  post,
  initials,
}: {
  name: string;
  createdAt: string;
  post: string;
  initials: string;
}) => {
  const colorScheme = useColorScheme()
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 3,
        borderRadius: 10,
        // backgroundColor: "#eee",
        elevation: 2
      }}
      className=" rounded-lg mb-8 bg-[#eee] dark:bg-neutral-900"
    >
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row p-3">
          <Avatar
            title={initials}
            rounded
            containerStyle={{ backgroundColor: "dodgerblue" }}
            
          />
          <View className="ml-2">
            <Text className="font-semibold dark:text-white">{name}</Text>
            <Text className="text-sm text-neutral-400">{createdAt}</Text>
          </View>
        </View>
        <AppButton variant="ghost" size="icon">
            <MaterialCommunityIcons   color={colorScheme === 'dark' ? "white" : "black"} name="dots-horizontal" size={20}/>
        </AppButton>
      </View>
      <Divider
        color={colorScheme === "dark" ?"#2b2b2b" : ""}
      />
      <View>
        <Text className="p-3 dark:text-white">{post}</Text>
      </View>
      {/* <Divider
          //   subHeader="Divider"
          //   inset={true}
          subHeaderStyle={{ color: "#000" }}
        /> */}
      {/* <View className="flex flex-row p-3 items-center justify-between py-2">
          <View className="flex flex-row">
            <AppButton variant="ghost" size="icon">
              <FontAwesome name="thumbs-o-up" />
            </AppButton>
            <AppButton variant="ghost" size="icon">
              <MaterialCommunityIcons name="message-outline" />
            </AppButton>
            <AppButton variant="ghost" size="icon">
              <MaterialCommunityIcons name="share" />
            </AppButton>
          </View>
          <Text className="text-sm text-muted-foreground">
            12 likes • 4 comments
          </Text>
        </View> */}
    </View>
  );
};

export default PostCard;
