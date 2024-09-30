import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { Toaster } from "@/components/ui/toaster";
import { PostProvider } from "./contexts/PostContext.tsx";
import { ChatProvider } from "./contexts/ChatContext.tsx";
import { SocketProvider } from "./contexts/SocketContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

const queryClient = new QueryClient();
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AgoraRTCProvider client={client}>
          <AuthProvider>
            <PostProvider>
              <SocketProvider>
                <ChatProvider>
                  <Toaster />
                  <App />
                </ChatProvider>
              </SocketProvider>
            </PostProvider>
          </AuthProvider>
        </AgoraRTCProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
