import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useUserStore } from "@/store";
import { Power } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  return (
    <Button
      size={"sm"}
      onClick={async () => {
        try {
          await api.post("/auth/logout"); ///delete http only cookie
        } catch (e) {
          console.log("could not log out");
        }
        localStorage.removeItem("chat-user"); //remove user from local storage
        setUser(null);
        navigate("/login", { replace: true });
      }}
    >
      Logout
      <Power className="ml-2" size={16} />
    </Button>
  );
};

export default LogoutButton;
