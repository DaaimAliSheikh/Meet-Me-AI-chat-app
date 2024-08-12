import { ConversationType } from "@/types";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import { useUserStore } from "@/store";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { forwardRef } from "react";
import { motion } from "framer-motion";

import { AnimatePresence } from "framer-motion";
import MessageDropdown from "./MessageDropdown";
interface ListItemProps {
  currentConvo: ConversationType;
}

const MessageList = forwardRef<HTMLLIElement, ListItemProps>(
  ({ currentConvo }, ref) => {
    const userId = useUserStore((state) => state.user?._id);

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
                ${index === currentConvo.messages.length - 1 && "border-4"}  
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
                  <div className="flex gap-2 items-start">
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
                      <MessageDropdown
                        message={message}
                        currentConvo={currentConvo}
                      />
                    )}
                  </div>
                  <p className="w-full text-xs">{message.message}</p>
                  {message.image && (
                    <img
                      src={message.image}
                      className="w-40 h-40 mx-auto md:w-60 md:h-60 object-contain"
                      alt="message image"
                    />
                  )}
                  <p className={`text-xs self-end flex items-center gap-1 `}>
                    {format(message.createdAt, "hh:mm a")}
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
