import { create } from "zustand";
import {
  IConversationStore,
  IUserStore,
  UserType,
  ISocketStore,
} from "./types";
import { Socket } from "socket.io-client";



export const useUserStore = create<IUserStore>((set) => {
  return {
    user: null,
    setUser: (newUser: UserType | null) => set({ user: newUser }),
  };
});

export const useSocketStore = create<ISocketStore>((set) => {
  return {
    onlineUsers: [],
    socket: null,
    setOnlineUsers: (users: string[]) => set({ onlineUsers: users }),
    setSocket: (newSocket: Socket | null) => set({ socket: newSocket }),
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
