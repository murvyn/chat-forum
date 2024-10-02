import { Entypo } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, useColorScheme } from "react-native";
import { Divider } from "@rneui/base";
import { UserProps } from "@/types";
import PotentialChat from "./PotentialChat";
import {
  BottomSheetSectionList,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";

const NewChatsModal = ({
  potentialChats,
}: {
  potentialChats: UserProps[] | null;
}) => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const { dismiss } = useBottomSheetModal();

  const handleSearch = useCallback((searchText: string) => {
    setSearch(searchText);
  }, []);

  const filteredChats = useMemo(() => {
    if (!potentialChats) return { students: [], lecturers: [], HODs: [] };

    return potentialChats.reduce(
      (acc, user) => {
        if (user.role === "student") acc.students.push(user);
        else if (user.role === "lecturer") acc.lecturers.push(user);
        else if (user.role === "HOD") acc.HODs.push(user);
        return acc;
      },
      { students: [], lecturers: [], HODs: [] } as {
        students: UserProps[];
        lecturers: UserProps[];
        HODs: UserProps[];
      }
    );
  }, [potentialChats]);

  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();
    return {
      students: filteredChats.students.filter((chat) =>
        `${chat.firstName.toLowerCase()} ${chat.lastName.toLowerCase()}`.includes(
          searchLower
        )
      ),
      lecturers: filteredChats.lecturers.filter((chat) =>
        `${chat.firstName.toLowerCase()} ${chat.lastName.toLowerCase()}`.includes(
          searchLower
        )
      ),
      HODs: filteredChats.HODs.filter((chat) =>
        `${chat.firstName.toLowerCase()} ${chat.lastName.toLowerCase()}`.includes(
          searchLower
        )
      ),
    };
  }, [filteredChats, search]);

  const data = [
    { title: "Students", data: filteredData.students },
    { title: "Lecturers", data: filteredData.lecturers },
    { title: "Head of Department", data: filteredData.HODs },
  ].filter((section) => section.data.length > 0);

  return (
    <View
      style={[
        {
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 16,
          width: "100%",
          backgroundColor: colorScheme === "dark" ? "#171717" : "white",
        },
      ]}
      className="bg-neutral-900"
    >
      <View
        style={{ alignItems: "center", marginBottom: 20 }}
        className="items-center mb-4 "
      >
        <View className="w-full items-center">
          <Text className="dark:text-white text-lg font-bold mt-5">
            New Chat
          </Text>
          {/* <View className="absolute right-0 top-5">
            <MaterialCommunityIcons
              name="close"
              color={colorScheme === "dark" ? "white" : "black"}
              size={25}
              onPress={onClose}
            />
          </View> */}
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: colorScheme === "light" ? "#e5e5e5" : "#262626",
            paddingHorizontal: 8,
            marginTop: 32,
          }}
          className="flex-row w-full rounded-xl items-center bg-neutral-200 dark:bg-neutral-800 px-2 mt-8 "
        >
          <Entypo
            name="magnifying-glass"
            color={colorScheme === "dark" ? "#737373" : "black"}
            size={25}
          />
          <TextInput
            style={{
              fontSize: 16,
              marginVertical: 8,
              marginBottom: 12,
              marginLeft: 4,
              flex: 1,
              color: colorScheme === "dark" ? "white" : "black",
            }}
            placeholder="Search name"
            onChangeText={(e) => {
              setSearch(e);
              handleSearch(e);
            }}
            value={search}
            clearButtonMode="while-editing"
            className=" text-base my-2 mb-3 ml-1 flex-1 dark:text-white"
          />
        </View>
      </View>
      <BottomSheetSectionList
        sections={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PotentialChat
            initials={`${item.firstName[0]}${item.lastName[0]}`}
            user={`${item.firstName} ${item.lastName}`}
            id={item._id}
            dismiss={dismiss}
            photo={item?.photoUrl as string}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="bg-white dark:text-white dark:bg-neutral-900 mb-4 font-semibold">
            {title}
          </Text>
        )}
        ItemSeparatorComponent={() => (
          <Divider color={colorScheme === "dark" ? "#2b2b2b" : ""} />
        )}
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

export default NewChatsModal;
