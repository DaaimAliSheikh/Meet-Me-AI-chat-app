import { useUserStore } from "@/store";
import { Outlet } from "react-router-dom";

const Navbar = () => {
  const user = useUserStore((state) => state.user);
  return (
    <>
      <nav className={` flex   ${user ? "" : "justify-center mt-2 "}`}>
        <h1 className="text-4xl font-dancing font-bold bg-gradient-to-r from-cyan-300 to-teal-100 bg-clip-text text-transparent">
          Meet Me
        </h1>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
