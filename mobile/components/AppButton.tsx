import {
  TouchableOpacity,
} from "react-native";
import React, { ReactNode } from "react";
import clsx from "clsx";

const AppButton = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  name,
  variant = "default",
  size = "default",
}: {
  children: ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  name?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  color?: string;
}) => {
  const variantStyles = {
    default: "bg-[#2DAC5C] text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-rose-500 text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      className={clsx(
        " inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors   disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        name,
      )}
    >
      {children}
    </TouchableOpacity>
  );
};

export default AppButton;
