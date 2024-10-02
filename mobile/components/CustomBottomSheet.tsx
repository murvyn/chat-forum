import React, { forwardRef, ReactNode, useCallback } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useColorScheme } from "react-native";

type CustomBottomSheetProps = {
  children: ReactNode;
  snapPoints?: string[];
};

const CustomBottomSheet = forwardRef<BottomSheetModal, CustomBottomSheetProps>(
  ({ children, snapPoints }: CustomBottomSheetProps, ref) => {
    const colorScheme = useColorScheme();
    const renderBackDrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );
    return (
      <BottomSheetModal
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#171717" : "white",
        }}
        enablePanDownToClose
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackDrop}
      >
        {children}
      </BottomSheetModal>
    );
  }
);

CustomBottomSheet.displayName = "CustomBottomSheet";

export default CustomBottomSheet;
