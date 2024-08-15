import api from "@/lib/api";
import { useEffect, useState } from "react";

import { ChatListUser, ConversationType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AnimatePresence, motion } from "framer-motion";
import Chat from "./Chat";
import { useConvesationStore, useSocketStore, useUserStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "./ui/card";
import generateInitials from "@/lib/generateInitials";
import { toast } from "./ui/use-toast";

const UsersList = () => {
  const [users, setUsers] = useState<ChatListUser[]>([]);
  const [searchValue, setsearchValue] = useState("");
  const [showConvo, setShowConvo] = useState(false);
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

  const { socket, onlineUsers } = useSocketStore((state) => ({
    socket: state.socket,
    onlineUsers: state.onlineUsers,
  }));
  const userId = useUserStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const { setConversation, conversation } = useConvesationStore((state) => ({
    setConversation: state.setConversation,
    conversation: state.conversation,
  }));

  useEffect(() => {
    socket?.on(
      "conversation-update",
      (user_id, conversationId, admins, participants) => {
        if (user_id != userId) {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["users"] });

          const currentConvo: ConversationType | undefined =
            queryClient.getQueryData([conversation?._id]);
          if (conversationId == currentConvo?._id) {
            ///to not interfere other peoples chats who are not affiliated with the changing chat as this event is sent to all convos
            if (![...admins, ...participants].includes(userId)) {
              setShowConvo(false);
              setConversation(null);
              toast({
                title: "Conversation was deleted",
              });
              return;
            }
            queryClient.invalidateQueries({ queryKey: [conversation?._id] });

            toast({
              title: "Conversation was updated",
            });
          }
        }
      }
    );
    socket?.on("conversation-refetch", (user_id, conversationId) => {
      if (user_id != userId) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        const currentConvo: ConversationType | undefined =
          queryClient.getQueryData([conversation?._id]);
        if (conversationId == currentConvo?._id) {
          queryClient.invalidateQueries({ queryKey: [conversation?._id] });

          toast({
            title: "Conversation was updated",
          });
        }
      }
    });
    socket?.on("conversation-delete", (user_id, conversationId) => {
      if (user_id != userId) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        const currentConvo: ConversationType | undefined =
          queryClient.getQueryData([conversation?._id]);
        if (conversationId == currentConvo?._id) {
          queryClient.invalidateQueries({ queryKey: [conversation?._id] });
          setConversation(null);

          setShowConvo(false);
          toast({
            title: "Conversation was deleted",
          });
        }
      }
    });

    return () => {
      socket?.off("conversation-update");
      socket?.off("conversation-refetch");
      socket?.off("conversation-delete");
    };
  }, [conversation, socket]);

  const { data, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      let users = await api.get("/users");

      return users.data;
    },
    staleTime: 5 * 1000 * 60,
  });

  useEffect(() => {
    if (isSuccess) {
      setUsers(data);
    }
  }, [isSuccess, data]);

  return (
    <>
      <div className="flex w-full  my-2  items-center space-x-2">
        <Input
          value={searchValue}
          onChange={(e) => setsearchValue(e.target.value)}
          placeholder="Search for people..."
        />
      </div>

      {isError ? (
        <Button onClick={() => refetch()} className="mt-[30vh]">
          Retry
        </Button>
      ) : isLoading ? (
        <Loader2 className="animate-spin mt-[30vh] mx-auto text-foreground" />
      ) : users.length === 0 ? (
        <p className="mt-[30vh] w-full text-center text-foreground">
          No users found
        </p>
      ) : (
        users
          .filter((user) =>
            user.username.toLowerCase().includes(searchValue.toLowerCase())
          )
          ?.map((user) => {
            return (
              <Card
                key={user?._id}
                onClick={() => {
                  setConversation({
                    type: "personal",
                    _id: user._id,
                    name: user.username,
                    image: user.image,
                  });
                  setShowConvo(true);
                }}
                className={`flex items-center my-2 p-2 hover:cursor-pointer justify-between ${
                  conversation?._id === user._id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex p-1 flex-grow overflow-hidden items-center gap-4">
                  <div className="relative">
                    <p
                      className={`absolute z-10 top-0 -right-1 h-4 w-4 rounded-full border-2 dark:border-white border-gray-500 ${
                        onlineUsers.find((user_id) => user_id === user?._id)
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></p>
                    <Avatar className={user?.image ? "" : "outline"}>
                      <AvatarImage src={user?.image || ""} />
                      <AvatarFallback>
                        {generateInitials(user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className=" font-bold dark:text-zinc-100 text-zinc-600 text-ellipsis whitespace-nowrap overflow-hidden">
                    {user?.username}
                  </h3>
                </div>
              </Card>
            );
          })
      )}
      <AnimatePresence>
        {showConvo ? (
          <motion.div
            animate={{ x: "0%" }}
            initial={{ x: "100vw" }}
            exit={{ x: "100vw" }}
            className="absolute border top-0 left-0 z-20  bg-background p-1  flex flex-col h-[100svh] w-[100%] md:hidden"
          >
            {conversation &&  !isMdBreakpoint && <Chat setShowConvo={setShowConvo} />}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default UsersList;
