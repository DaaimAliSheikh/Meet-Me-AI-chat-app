import { useUserStore } from "@/store";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Moon, Sun } from "lucide-react";
import { format } from "date-fns";
import LogoutButton from "./LogoutButton";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

const Navbar = () => {
  const user = useUserStore((state) => state.user);

  const { theme, setTheme } = useTheme();

  return (
    <>
      <main className=" h-[100vh] flex flex-col ">
        <nav
          className={` flex w-full p-1  mx-auto items-center  ${
            user ? "justify-between " : "justify-center "
          }`}
        >
          <h1
            className={`text-4xl font-dancing font-bold  ${
              theme == "dark"
                ? "bg-gradient-to-r from-cyan-300 to-teal-100 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-cyan-300 to-teal-100 rounded-lg px-2"
            } ${!user ? "mt-3" : ""} `}
          >
            Meet Me
          </h1>

          {!!user && (
            <Dialog>
              <DialogTrigger asChild>
                <Avatar className="w-10 h-10 m-1 hover:cursor-pointer border-2">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="text-sm">
                    {generateInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="mx-auto mb-2">Profile</DialogTitle>

                  <Avatar className="border-2  h-14 w-14  mx-auto">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback>
                      {generateInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                </DialogHeader>

                <div className="flex flex-col mb-4 items-center gap-2">
                  <h2 className=" text-sm ">{user?.username}</h2>
                  <div className="flex items-center justify-center gap-2">
                    <h2>{user?.email}</h2>
                    <Badge className="flex text-xs items-center gap-1">
                      {user?.emailVerified ? "Verified" : null}{" "}
                      <CheckCheck size={16} />
                    </Badge>
                  </div>
                  <p className="text-xs">
                    Profile created on{" "}
                    {format(user?.createdAt as Date, "MMMM do, yyyy")}
                  </p>
                </div>
                <div className="flex items-center mx-auto w-fit gap-2">
                  <LogoutButton />
                  <Button
                    size={"sm"}
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  >
                    Theme{" "}
                    {theme === "light" ? (
                      <Sun className="ml-2" size={18} />
                    ) : (
                      <Moon className="ml-2" size={16} />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </nav>

        <Outlet />
      </main>
    </>
  );
};

export default Navbar;
