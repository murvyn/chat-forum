import React from "react";
import { UserProps } from "@/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";

import { baseUrl, getRequest, postRequest } from "@/utils/service";
import { setStorageItemAsync, useStorageState } from "@/hooks/useStorageState";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextProps {
  user: UserProps | null;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
  login: (body: BodyInit) => Promise<{ message: string; error: boolean }>;
  logout: () => Promise<{ message: string; error: boolean }>;
  getUser: (userId: string) => Promise<UserProps | null>;
  isLoading: boolean;
  session?: string | null;
  token: string
  loginLoading: boolean
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => null,
  login: () => Promise.resolve({ message: "", error: false }),
  logout: () => Promise.resolve({ message: "", error: false }),
  getUser: () => Promise.resolve(null),
  isLoading: false,
  session: null,
  token: '',
  loginLoading: false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [[isLoading, session], setSession] = useStorageState("user");
  const [user, setUser] = useState<UserProps | null>(null);
  const [token, setToken] = useState("");
  const queryClient = useQueryClient()
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (session) {
        setUser(JSON.parse(session));
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          setToken(token);
        }
      }
    };
    fetch();
  }, [session]);

  const login = useCallback(
    async (body: BodyInit) => {
      setLoginLoading(true)
      try {
        const response = await postRequest(`${baseUrl}/api/auth/login`,undefined, body);
        const { token } = response;
        if (token) {
          await setStorageItemAsync("token", token);
          const decoded: UserProps = jwtDecode(token);
          setSession(JSON.stringify(decoded));
          setUser(decoded as UserProps);
          setToken(token)
          queryClient.invalidateQueries({queryKey: ['users', decoded._id]})
        }
        return response;
      } catch (error) {
        console.log("login in error",error);
        return { message: "Login failed", error: true };
      }finally{
        setLoginLoading(false)
      }
    },
    [setSession, queryClient]
  );

  const getUser = useCallback(async (userId: string) => {
    try {
      const response = await getRequest(`${baseUrl}/api/users/${userId}`, token);
      return response?.user;
    } catch (error) {
      console.log("getting users error",error);
    }
  }, []);

  const logout = useCallback(async () => {
    setSession(null);
    setUser(null);
    setToken("")
    await SecureStore.deleteItemAsync("token");
    queryClient.clear()
    return {
      message: "Logged out successfully",
      error: false,
    };
  }, [setSession, queryClient]);

  const value: AuthContextProps = {
    user,
    setUser,
    login,
    getUser,
    logout,
    isLoading,
    session,
    token,
    loginLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production" && !context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
