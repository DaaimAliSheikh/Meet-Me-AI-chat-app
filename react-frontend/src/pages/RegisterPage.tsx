import { baseURL } from "@/baseURL";
import RegisterForm from "@/components/RegisterForm";
import api from "@/lib/api";
import { useSocketStore, useUserStore } from "@/store";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const RegisterPage = () => {
  const setUser = useUserStore((state) => state.setUser);
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
        setUser(response.data.user);
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
      } catch (e) {}
    })();
  }, []);
  return (
    <div className="p-1 max-w-[35rem]   w-full  flex flex-col  mx-auto mt-6">
      <h2 className="text-xl p-1 py-2">Register</h2>
      <RegisterForm />
      <Link
        to={"/login"}
        className="text-sm text-muted-foreground text-center  underline my-4"
      >
        Already have an account? Sign In
      </Link>
    </div>
  );
};

export default RegisterPage;
