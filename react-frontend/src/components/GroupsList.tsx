import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import { Card } from "./ui/card";
import { ChatListGroup } from "@/types";
import generateInitials from "@/lib/generateInitials";
import { Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Chat from "./Chat";
import { useConvesationStore, useSocketStore, useUserStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateGroupForm from "./CreateGroupForm";
import { ScrollArea } from "./ui/scroll-area";

const GroupsList = () => {
  const [groups, setGroups] = useState<ChatListGroup[]>([]);
  const [searchValue, setsearchValue] = useState("");
  const [showConvo, setShowConvo] = useState(false);
  const [open, setOpen] = useState(false);

  const socket = useSocketStore((state) => state.socket);
  const userId = useUserStore((state) => state.user?._id);
  const queryClient = useQueryClient();
  const { setConversation, conversation } = useConvesationStore((state) => ({
    setConversation: state.setConversation,
    conversation: state.conversation,
  }));

  useEffect(() => {
    ///socket events for what others will see when group is updated/deleted/kicked out/left
    socket?.on(
      "conversation-update",
      (user_id, conversationId, admins, participants) => {
        if (user_id != userId) {
          queryClient.invalidateQueries({ queryKey: ["groups"] });
          queryClient.invalidateQueries({ queryKey: ["users"] });

          queryClient.invalidateQueries({ queryKey: [conversation?._id] });
          if (![...admins, ...participants].includes(userId))
            if (conversationId == conversation?._id) setShowConvo(false); ///to not close other peoples chats who are not affiliated with the changing chat
        }
      }
    );
    socket?.on("conversation-refetch", (user_id) => {
      if (user_id != userId) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: [conversation?._id] });
      }
    });
    socket?.on("conversation-delete", (user_id, conversationId) => {
      if (user_id != userId) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: [conversation?._id] });
        if (conversationId == conversation?._id) setShowConvo(false);
      }
    });

    return () => {
      socket?.off("conversation-update");
      socket?.off("conversation-refetch");
      socket?.off("conversation-delete");
    };
  }, [conversation]);

  const { data, isError, isLoading, isSuccess, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const users = await api.get("/conversations/groups");
      return users.data;
    },
    staleTime: 5 * 1000 * 60,
  });

  useEffect(() => {
    if (isSuccess) {
      setGroups(data);
    }
  }, [isSuccess, data]);

  return (
    <>
      <div className="flex flex-col w-full  my-2  items-center">
        <Input
          value={searchValue}
          onChange={(e) => setsearchValue(e.target.value)}
          placeholder="Search for people..."
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className=" mt-2 self-stretch flex gap-1">
              Create Group <Plus size={17} />
            </Button>
          </DialogTrigger>
          <DialogContent className="px-0 md:px-4">
            <DialogTitle className="pl-2">Create a group</DialogTitle>
            <CreateGroupForm setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className={"h-[65vh]"}>
        {isError ? (
          <Button onClick={() => refetch()} className="mt-[30vh]">
            Retry
          </Button>
        ) : isLoading ? (
          <Loader2 className="animate-spin  mt-[30vh] mx-auto text-foreground" />
        ) : groups.length === 0 ? (
          <p className="mt-[30vh] text-center  text-foreground">
            No groups found
          </p>
        ) : (
          groups
            .filter((group) =>
              group.name.toLowerCase().includes(searchValue.toLowerCase())
            )
            ?.map((group) => {
              return (
                <Card
                  key={group?._id}
                  onClick={() => {
                    setConversation({
                      type: "group",
                      _id: group._id,
                      name: null,
                      image: null,
                    });
                    setShowConvo(true);
                  }}
                  className={`flex my-2 items-center p-2 hover:cursor-pointer justify-between ${
                    conversation?._id === group._id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex p-1 flex-grow overflow-hidden items-center gap-4">
                    <Avatar className={"border-2 border-muted-foreground"}>
                      <AvatarImage src={group?.image || ""} />
                      <AvatarFallback>
                        {generateInitials(group?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className=" text-zinc-600 dark:text-zinc-100 font-bold text-ellipsis whitespace-nowrap overflow-hidden">
                      {group?.name}
                    </h3>
                  </div>
                  <Badge>2</Badge>
                </Card>
              );
            })
        )}
      </ScrollArea>
      <AnimatePresence>
        {showConvo ? (
          <motion.div
            animate={{ x: "0%" }}
            initial={{ x: "100%" }}
            exit={{ x: "100%" }}
            className="absolute border top-0 left-0  bg-background p-1 overflow-hidden flex flex-col h-screen w-[100%] md:hidden"
          >
            {conversation && <Chat setShowConvo={setShowConvo} />}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default GroupsList;
