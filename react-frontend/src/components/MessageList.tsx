import { ConversationType, MessageType } from "@/types";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import { useConvesationStore, useUserStore } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, ChevronDown, Loader2, Send, X } from "lucide-react";
import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
interface ListItemProps {
  currentConvo: ConversationType;
}

const MessageList = forwardRef<HTMLLIElement, ListItemProps>(
  ({ currentConvo }, ref) => {
    const userId = useUserStore((state) => state.user?._id);
    const queryClient = useQueryClient();
    const [popoverOpen, setPopoverOpen] = useState(false);

    const {
      register,
      handleSubmit,
      formState: { isSubmitting },
    } = useForm({});

    const conversation = useConvesationStore((state) => state.conversation);

    const { mutate } = useMutation({
      mutationFn: async ({
        messageId,
        public_id,
      }: {
        messageId: string;
        public_id: string;
      }) => {
        console.log("ran");
        await api.patch(`/messages/${messageId}`, {
          public_id,
        });
        queryClient.setQueryData([conversation?._id], (oldData: any) => {
          return {
            ...oldData,
            messages: oldData?.messages.filter(
              (message: MessageType) => message._id !== messageId
            ),
          };
        });
      },
      onMutate: async ({ messageId }: { messageId: string }) => {
        const old = queryClient.getQueryData([conversation?._id]);
        queryClient.setQueryData([conversation?._id], (oldData: any) => {
          return {
            ...oldData,
            messages: oldData?.messages.filter(
              (message: MessageType) => message._id !== messageId
            ),
          };
        });
        return { old };
      },

      onError: async (_error, _variables, context) => {
        queryClient.setQueryData([conversation?._id], context?.old);
      },
    });

    return (
      <ul className="flex flex-col px-1">
        <AnimatePresence mode="popLayout">
          {currentConvo.messages.map((message, index) => {
            return (
              <motion.li
                layout
                ref={index === currentConvo.messages.length - 1 ? ref : null}
                key={message._id}
                className={`${message.senderId === userId && "self-end mr-1"}   
              flex my-2 items-start gap-2 max-w-[60%] md:max-w-[40%]  min-w-[10rem]`}
              >
                {message.senderId !== userId && (
                  <Avatar className={"my-1 w-8 h-8 border-foreground border-2"}>
                    <AvatarImage
                      src={
                        [
                          ...currentConvo.admins,
                          ...currentConvo.participants,
                        ].find((user) => user._id === message.senderId)
                          ?.image || ""
                      }
                    />
                    <AvatarFallback className="text-sm">
                      {generateInitials(
                        [
                          ...currentConvo.admins,
                          ...currentConvo.participants,
                        ].find((user) => user._id === message.senderId)
                          ?.username
                      )}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={` ${
                    message.senderId !== userId && "bg-primary "
                  } p-2 flex flex-col gap-1 w-full `}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold">
                      {
                        [
                          ...currentConvo.admins,
                          ...currentConvo.participants,
                        ].find((user) => user._id === message.senderId)
                          ?.username
                      }
                    </p>

                    {message.senderId === userId && (
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger className="border rounded-md">
                          <ChevronDown size={16} />
                        </PopoverTrigger>
                        <PopoverContent className="w-28 p-1">
                          <ul className="p-0 text-xs flex flex-col gap-1 ">
                            <li
                              onClick={() => {
                                mutate({
                                  messageId: message._id,
                                  public_id: message.public_id,
                                });
                              }}
                              className="p-1  hover:cursor-pointer hover:bg-secondary  flex items-center justify-evenly bg-destructive rounded-md"
                            >
                              Delete <X size={10} />
                            </li>
                            <Dialog>
                              <DialogTrigger asChild>
                                <li className="p-1 hover:cursor-pointer hover:bg-secondary  flex items-center justify-evenly  rounded-md">
                                  Edit
                                </li>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit message</DialogTitle>
                                  <form
                                    onSubmit={handleSubmit(async (data) => {
                                      console.log(data.message);
                                      await api.put(
                                        `/messages/${message?._id}`,
                                        {
                                          message: data.message,
                                          conversationId: currentConvo._id,
                                        }
                                      );
                                      queryClient.setQueryData(
                                        [conversation?._id],
                                        (oldData: any) => {
                                          return {
                                            ...oldData,
                                            messages: oldData?.messages.map(
                                              (msg: MessageType) =>
                                                msg._id === message._id
                                                  ? {
                                                      ...msg,
                                                      message: data.message,
                                                    }
                                                  : msg
                                            ),
                                          };
                                        }
                                      );
                                      setPopoverOpen(false);
                                    })}
                                    className="flex my-2 gap-2"
                                  >
                                    <Input
                                      {...register("message")}
                                      defaultValue={message.message}
                                    />
                                    <Button
                                      type="submit"
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? (
                                        <Loader2 className="animate-spin" />
                                      ) : (
                                        <Send size={17} />
                                      )}
                                    </Button>
                                  </form>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </ul>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <p className="w-full text-xs">{message.message}</p>
                  {message.image && (
                    <img
                      src={message.image}
                      className="w-40 h-40 md:w-52 md:h-52 object-contain"
                      alt="message image"
                    />
                  )}
                  <p className={`text-xs self-end flex items-center gap-1 `}>
                    {formatDistanceToNow(message.createdAt, {
                      addSuffix: true,
                    })}
                    {message.senderId !== userId || (
                      <CheckCheck
                        size={14}
                        className={
                          message.seenBy.length ===
                          [...currentConvo.admins, ...currentConvo.participants]
                            .length
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    )}
                  </p>
                </Card>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    );
  }
);

export default MessageList;
