import { View, Text } from "react-native";
import React from "react";
import { Avatar } from "@rneui/base";

const NewPost = () => {
  return (
    <View className="px-4">
      <View className="flex flex-row space-x-2">
        {/* <View className="flex items-center space-x-3"> */}
        <Avatar title="JD" rounded containerStyle={{ backgroundColor: "dodgerblue" }} />
        {/* </View> */}

        <View className="flex-1 bg-neutral-200 dark:bg-neutral-800 flex justify-center rounded-xl">
          <Text className="ml-4 text-sm text-neutral-500">
           {` What's on your mind?`}
          </Text>
        </View>
      </View>
      {/* <View className="my-2">
        <Divider
          //   subHeader="Divider"
          //   inset={true}
          subHeaderStyle={{ color: "#000" }}
        />
      </View>
      <View className="flex flex-row w-full justify-center">
        <AppButton variant="ghost">
          <FontAwesome5 name="photo-video" />
          <Text>Photo/Video</Text>
        </AppButton>
        <AppButton variant="ghost">
        <FontAwesome name="microphone" />
          <Text>Photo/Video</Text>
        </AppButton>
        <AppButton variant="ghost">
        <FontAwesome name="microphone" />
          <Text>Photo/Video</Text>
        </AppButton>
      </View> */}
    </View>
  );
};

export default NewPost;
