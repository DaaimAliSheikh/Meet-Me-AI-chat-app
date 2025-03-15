import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useSocketStore, useUserStore } from "@/store";
import { useEffect, useState } from "react";
import { baseURL } from "@/baseURL";
import { io } from "socket.io-client";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const setUser = useUserStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);
  const { setSocket, setOnlineUsers } = useSocketStore((state) => ({
    setSocket: state.setSocket,
    setOnlineUsers: state.setOnlineUsers,
  }));

  ///for after oauth redirect to this page
  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("auth/login/success");
        if (!response.data.user) return;
        const socket = io(baseURL, {
          query: { userId: response.data.user._id },
        });
        socket?.on(
          "onlineUsers",
          ({ onlineUsersIds }: { onlineUsersIds: string[] }) => {
            setOnlineUsers(onlineUsersIds);
          }
        );
        setSocket(socket);
        setUser(response.data.user);
      } catch (e) {
        console.log("User Not Logged In, Navigating to Login Page");
      }
      console.log("setting to false")
      setLoading(false);
    })();
  }, []);
  return (
    <div className="p-1 flex w-full flex-col max-w-[35rem] mx-auto mt-6">
      {loading ? (
        <Loader2
          size={40}
          className="animate-spin mx-auto text-primary mt-40 "
        />
      ) : (
        <>
          <h2 className="text-xl p-1 py-2">Login</h2>
          <LoginForm />
          <Link
            to={"/register"}
            className="text-sm text-muted-foreground text-center  underline my-4"
          >
            Don't have an account? Sign Up
          </Link>
        </>
      )}
    </div>
  );
};

export default LoginPage;
