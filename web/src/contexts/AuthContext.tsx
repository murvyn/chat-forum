import { baseUrl, getRequest, postRequest } from "@/utils/services";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { UserProps } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextProps {
  user: UserProps | null;
  setUser: Dispatch<SetStateAction<UserProps | null>>;
  login: (
    url: string,
    body: BodyInit
  ) => Promise<{ message: string; error: boolean }>;
  logout: () => Promise<{ message: string; error: boolean }>;
  getUser: (userId: string) => Promise<UserProps | null>;
  token: string;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => null,
  login: () => Promise.resolve({ message: "", error: false }),
  logout: () => Promise.resolve({ message: "", error: false }),
  getUser: () => Promise.resolve(null),
  token: "",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const loadUserFromSession = () => {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };
  const [user, setUser] = useState(loadUserFromSession);
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const { toast } = useToast();

  const login = useCallback(async (url: string, body: BodyInit) => {
    try {
      const response = await postRequest(url, "", body);
      if (response.error) {
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
      const { token } = response;
      if (token) {
        setToken(token);
        const decoded = jwtDecode(token);
        sessionStorage.setItem("user", JSON.stringify(decoded));
        setUser(decoded as UserProps);
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      return { message: error, error: true };
    }
  }, []);

  const getUser = useCallback(async (userId: string) => {
    try {
      const response = await getRequest(`${baseUrl}/users/${userId}`, "");
      return response.user;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const logout = useCallback(async () => {
    Cookies.remove("token");
    sessionStorage.removeItem("user");
    setUser(null);
    localStorage.clear();
    queryClient.clear();
    return Promise.resolve({
      message: "Logged out successfully",
      error: false,
    });
  }, []);

  const value: AuthContextProps = {
    user,
    setUser,
    login,
    logout,
    getUser,
    token,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
