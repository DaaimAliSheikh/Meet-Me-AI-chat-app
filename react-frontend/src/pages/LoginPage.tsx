import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useUserStore } from "@/store";
import { useEffect } from "react";

const LoginPage = () => {
  const setUser = useUserStore((state) => state.setUser);

  ///for after oauth redirect to this page
  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("auth/login/success");
        if (!response.data.user) return;
        setUser(response.data.user);
        localStorage.setItem("chat-user", JSON.stringify(response.data.user));
      } catch (e) {
        console.log("could not get user");
      }
    })();
  }, []);
  return (
    <div className="p-1 flex flex-col max-w-[35rem] mx-auto mt-6">
      <h2 className="text-xl p-1 py-2">Login</h2>
      <LoginForm />
      <Link
        to={"/register"}
        className="text-sm text-muted-foreground text-center  underline my-4"
      >
        Don't have an account? Sign Up
      </Link>
    </div>
  );
};

export default LoginPage;
