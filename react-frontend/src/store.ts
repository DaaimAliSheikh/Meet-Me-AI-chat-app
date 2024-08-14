import { create } from "zustand";
import {
  IConversationStore,
  IUserStore,
  UserType,
  ISocketStore,
} from "./types";
import api from "./lib/api";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { baseURL } from "./baseURL";

let user: UserType | null = null;
let socket: Socket | null = null;

socket = io(baseURL);

(async () => {
  try {
    await api.get("/auth/login/success");
    user =
      (JSON.parse(localStorage.getItem("chat-user") as string) as UserType) ||
      null;
  } catch {
    user = null;
    socket = null;
  }
})();

export const useUserStore = create<IUserStore>((set) => {
  return {
    user,
    setUser: (newUser: UserType | null) => set({ user: newUser }),
  };
});

export const useSocketStore = create<ISocketStore>((set) => {
  return {
    onlineUsers: [],
    socket,
    setOnlineUsers: (users: string[]) => set({ onlineUsers: users }),
    ///set socket in app.tsx after validating user
  };
});

export const useConvesationStore = create<IConversationStore>((set) => {
  return {
    conversation: null,

    setConversation: (
      conversation: {
        type: string | null;
        _id: string | null;
        name: string | null;
        image: string | null;
      } | null
    ) => set({ conversation }),
  };
});
