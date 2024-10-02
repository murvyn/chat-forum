import {
  View,
  Text,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import AppButton from "@/components/AppButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import clsx from "clsx";
import { Divider } from "@rneui/themed";
import UserChat from "@/components/UserChat";
import { useChat } from "@/context/ChatContext";
import NewChatsModal from "@/components/NewChatsModal";
import { UserChatWithId } from "@/types";
import { getInitials, handleSearch } from "@/utils/helpers";
import { useSortedChats } from "@/hooks/useFetchLatestMessage";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import { debounce } from "lodash";
import { useQueryClient } from "@tanstack/react-query";

type FilterOption = "All" | "Unread" | "Students" | "Lecturers";

const DirectMessages = () => {
  const [filter, setFilter] = useState<FilterOption>("All");
  const [searchResults, setSearchResults] = useState<UserChatWithId[]>([]);
  const colorScheme = useColorScheme();
  const { userChats, isLoadingUserChats, potentialChats } = useChat();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [blur, setBlur] = useState(false);
  const snapShot = useMemo(() => ["90%"], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const filters: FilterOption[] = ["All", "Unread", "Students", "Lecturers"];
  const queryClient = useQueryClient();

  const sortedUserChats = useSortedChats(userChats || [], filter);

  const refresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["userChats"] });
    userChats?.forEach((chat) => {
      queryClient.invalidateQueries({
        queryKey: ["latestChatMessage", chat.chatId],
      });
    });
    setRefreshing(false);
  }, []);

  const handleSearchDebounced = useCallback(
    debounce((search: string, userChats: UserChatWithId[]) => {
      const results = handleSearch(search, userChats);
      if (results) {
        setSearchResults(results);
      }
    }, 300),
    []
  );

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
        className={`text-4xl px-4 font-bold mt-3 dark:text-white ${blur || search ? "hidden" : ""}`}
      >
        Chats
      </Text>
      <TextInput
        placeholder="Search"
        onFocus={() => setBlur(true)}
        onBlur={() => setBlur(false)}
        onChangeText={(e) => {
          setSearch(e);
          handleSearchDebounced(e, userChats || []);
        }}
        value={search}
        clearButtonMode="while-editing"
        className="block h-10 mx-4 rounded-xl my-2 px-3 text-sm bg-neutral-200 dark:bg-neutral-800 dark:text-white"
      />

      <View className={`${blur || search ? "hidden" : ""} flex-row px-4 mb-6`}>
        {filters.map((filterOption) => (
          <AppButton
            key={filterOption}
            onPress={() => setFilter(filterOption)}
            name={clsx(
              "bg-neutral-200 dark:bg-neutral-800 rounded-xl h-9 mr-3",
              filter === filterOption && "bg-green-200 dark:bg-green-900"
            )}
          >
            <Text
              className={clsx(
                "font-semibold text-neutral-600 dark:text-neutral-500",
                filter === filterOption && "text-green-900 dark:text-green-100"
              )}
            >
              {filterOption}
            </Text>
          </AppButton>
        ))}
      </View>

      {isLoadingUserChats ? (
        <>
          <View className="items-center justify-center">
            <ActivityIndicator />
          </View>
        </>
      ) : (
        <>
          {sortedUserChats && sortedUserChats?.length > 0 ? (
            <FlatList
              style={{ paddingHorizontal: 16 }}
              data={search ? searchResults : sortedUserChats}
              keyExtractor={(item) => item.chatId as string}
              renderItem={({ item }) => (
                <UserChat
                  initials={getInitials(
                    item.user?.firstName || "",
                    item.user?.lastName || ""
                  )}
                  sender={`${item.user?.firstName} ${item.user?.lastName}`}
                  chatId={item.chatId as string}
                  userId={item.user?._id as string}
                  message={item.latestMessage ? item.latestMessage : null}
                  photo={item.user?.photoUrl as string}
                />
              )}
              ItemSeparatorComponent={() => (
                <Divider
                  inset
                  color={colorScheme === "dark" ? "#2b2b2b" : ""}
                />
              )}
              contentContainerStyle={{ paddingBottom: 200 }}
              initialNumToRender={10}
              refreshing={refreshing}
              onRefresh={refresh}
            />
          ) : (
            <View className="flex-1 flex-row items-center justify-center">
              <Text className="dark:text-neutral-800 mr-2">
                No chats, start by pressing
              </Text>
              <View className="border border-neutral-800 rounded-full">
                <MaterialCommunityIcons
                  color={colorScheme === "dark" ? "#262626" : "black"}
                  name="plus"
                  size={25}
                />
              </View>
            </View>
          )}
        </>
      )}
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={snapShot}>
        <NewChatsModal potentialChats={potentialChats} />
      </CustomBottomSheet>
    </View>
  );
};

export default DirectMessages;
