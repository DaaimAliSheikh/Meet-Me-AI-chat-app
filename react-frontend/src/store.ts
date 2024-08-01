import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface UserType {
  _id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image: string;
  provider: string;
  updatedAt: Date;
  createdAt: Date;
}

interface IUserStore {
  user: UserType | null;
  setUser: (newUser: UserType | null) => void;
}

const API_URL = "http://localhost:3000";

const user = (localStorage.getItem("chat-user") as string)
  ? JSON.parse(localStorage.getItem("chat-user") as string)
  : null;

const socket = io(API_URL);

export const useUserStore = create<IUserStore>((set) => {
  return {
    user,
    setUser: (newUser: UserType | null) => set({ user: newUser }),
  };
});

export const useSocketStore = create<Socket | null>((_set) => {
  return socket;
});
