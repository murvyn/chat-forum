import {
  View,
  Text,
  TextInput,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import AppButton from "@/components/AppButton";
import clsx from "clsx";
import { useChat } from "@/context/ChatContext";
import { Divider } from "@rneui/themed";
import ChannelChat from "@/components/ChannelChat";
import { Message, UserGroupChatWithId } from "@/types";
import { handleSearch } from "@/utils/helpers";
import { useSortedChats } from "@/hooks/useFetchLatestMessage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import CreateChannelModal from "@/components/CreateChannelModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAuth } from "@/context/AuthContext";
import { debounce } from "lodash";
import { useQueryClient } from "@tanstack/react-query";

const Channels = () => {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const { userGroupChats, isLoadingUserChats, users, setChatId, setMessages } = useChat();
  const colorScheme = useColorScheme();
  const snapPoints = useMemo(() => ["80%"], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { token } = useAuth();
  const [searchResults, setSearchResults] = useState<UserGroupChatWithId[]>([]);
  const [search, setSearch] = useState("");
  const [blur, setBlur] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const sortedUserChats = useSortedChats(userGroupChats || [], filter);

  const handleSearchDebounced = useCallback(
    debounce((search: string, userChats: UserGroupChatWithId[]) => {
      const results = handleSearch(search, userChats);
      if (results) {
        setSearchResults(results);
      }
    }, 300),
    []
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["userChats"] });
    userGroupChats?.forEach((chat) => {
      queryClient.invalidateQueries({
        queryKey: ["latestChatMessage", chat.chatId],
      });
    });
    setRefreshing(false);
  }, []);

  return (
    <View className="dark:bg-black py-6 flex-1">
      <View
        className={`flex-row items-center px-4 justify-between ${blur || search ? "hidden" : ""}`}
      >
        <AppButton
          name="bg-neutral-200 dark:bg-neutral-800 rounded-full h-7 w-7"
          size="icon"
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            color={colorScheme === "dark" ? "white" : "black"}
            size={25}
          />
        </AppButton>
        <View className="flex-row items-center">
          <AppButton
            name="bg-neutral-200 dark:bg-neutral-800 rounded-full h-7 w-7"
            size="icon"
          >
            <MaterialCommunityIcons
              color={colorScheme === "dark" ? "white" : "black"}
              name="camera"
              size={20}
            />
          </AppButton>
          <AppButton
            onPress={() => bottomSheetRef.current?.present()}
            name=" rounded-full  ml-3 w-8 h-8"
            size="icon"
          >
            <MaterialCommunityIcons
              color={colorScheme === "dark" ? "black" : "white"}
              name="plus"
              size={25}
            />
          </AppButton>
        </View>
      </View>
      <Text
        className={`text-3xl px-4 font-bold mt-3 dark:text-white ${blur || search ? "hidden" : ""}`}
      >
        Channels
      </Text>
      <TextInput
        placeholder="Search"
        onFocus={() => setBlur(true)}
        onBlur={() => setBlur(false)}
        onChangeText={(e) => {
          setSearch(e);
          handleSearchDebounced(e, userGroupChats || []);
        }}
        value={search}
        clearButtonMode="while-editing"
        className="block h-10 mx-4 rounded-xl my-2 px-3 text-sm  bg-neutral-200 dark:bg-neutral-800 dark:text-white"
      />
      <View className={`${blur || search ? "hidden" : ""} flex-row px-4 mb-6`}>
        <AppButton
          onPress={() => setFilter("All")}
          name={clsx(
            "bg-neutral-200 dark:bg-neutral-800 rounded-2xl active h-9 mr-3",
            filter === "All" && "bg-green-200 dark:bg-green-900 "
          )}
        >
          <Text
            className={clsx(
              "font-semibold text-neutral-600 dark:text-neutral-500",
              filter === "All" && "text-green-900 dark:text-green-100"
            )}
          >
            All
          </Text>
        </AppButton>
        <AppButton
          onPress={() => setFilter("Unread")}
          name={clsx(
            "bg-neutral-200 dark:bg-neutral-800 rounded-xl h-9",
            filter === "Unread" && "bg-green-200 dark:bg-green-900"
          )}
        >
          <Text
            className={clsx(
              "font-semibold text-neutral-600 dark:text-neutral-500",
              filter === "Unread" && "text-green-900 dark:text-green-100"
            )}
          >
            Unread
          </Text>
        </AppButton>
      </View>
      {isLoadingUserChats ? (
        <>
          <View className="flex-1 flex-row items-center justify-center">
            <ActivityIndicator />
          </View>
        </>
      ) : (
        <FlatList
          style={{ paddingHorizontal: 16 }}
          data={search ? searchResults : sortedUserChats}
          keyExtractor={(item) => item.chatId as string}
          renderItem={({ item }) => (
            <ChannelChat
              chatId={item.chatId as string}
              name={item.name as string}
              message={item.latestMessage as Message}
            />
          )}
          ItemSeparatorComponent={() => (
            <Divider inset color={colorScheme === "dark" ? "#2b2b2b" : ""} />
          )}
          contentContainerStyle={{ paddingBottom: 200 }}
          initialNumToRender={10}
          refreshing={refreshing}
          onRefresh={refresh}
        />
      )}
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <CreateChannelModal token={token} setChatId={setChatId} users={users} setMessages={setMessages} />
      </CustomBottomSheet>
    </View>
  );
};

export default Channels;
