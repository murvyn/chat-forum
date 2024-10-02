import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import "react-native-get-random-values";
import { Colors } from "@/constants/Colors";

const queryClient = new QueryClient();

export default function RootLayout() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.primary,
    },
  };
  useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <PaperProvider theme={theme}>
            <BottomSheetModalProvider>
              <Slot />
            </BottomSheetModalProvider>
          </PaperProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
