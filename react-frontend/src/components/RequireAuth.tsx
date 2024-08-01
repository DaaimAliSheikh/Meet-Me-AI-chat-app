import { useUserStore } from "@/store";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const user = useUserStore((state) => state.user);
  return user ? <Outlet /> : <Navigate to={"/login"} />;
};

export default RequireAuth;
