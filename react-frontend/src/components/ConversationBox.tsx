import { useConvesationStore } from "@/store";
import Chat from "./Chat";
import { useEffect, useState } from "react";

const ConversationBox = () => {
  const conversation = useConvesationStore((state) => state.conversation);
  const [isMdBreakpoint, setIsMdBreakpoint] = useState(
    window.innerWidth >= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMdBreakpoint(window.innerWidth >= 768);
    };

    // Add event listener on component mount
    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className={`md:flex flex-col border  rounded-md p-2 bg-background overflow-hidden  hidden basis-[65%] `}
    >
      {isMdBreakpoint && (conversation ? <Chat /> : "no chats")}
    </div>
  );
};

export default ConversationBox;
