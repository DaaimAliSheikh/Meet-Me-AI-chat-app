import { useUserStore } from "@/store";
import { Navigate, Outlet } from "react-router-dom";

const AuthRoutes = () => {
  const user = useUserStore((state) => state.user);
  return !user ? <Outlet /> : <Navigate to={"/"} />;
};

export default AuthRoutes;
