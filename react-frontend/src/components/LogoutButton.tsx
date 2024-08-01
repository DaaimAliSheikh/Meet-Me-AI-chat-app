import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  return (
    <Button
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
    </Button>
  );
};

export default LogoutButton;
