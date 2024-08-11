import { ConversationType } from "@/types";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import { useConvesationStore, useUserStore } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck } from "lucide-react";
import { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";
interface ListItemProps {
  currentConvo: ConversationType;
}

const MessageList = forwardRef<HTMLLIElement, ListItemProps>(
  ({ currentConvo }, ref) => {
    
    const userId = useUserStore((state) => state.user?._id);

    return (
      <ul className="flex flex-col px-1">
        {currentConvo.messages.map((message, index) => {
          return (
            <AnimatePresence mode="popLayout">
              <li
                ref={index === currentConvo.messages.length - 1 ? ref : null}
                key={message._id}
                className={`${message.senderId === userId && "self-end mr-1"}   
              flex my-2 items-start gap-2 max-w-[60%] md:max-w-[40%]`}
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
                      <Select>
                        <SelectTrigger
                          className={`w-5 h-5 p-0  `}
                        ></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delete">Delete</SelectItem>
                          <SelectItem value="update">Dark</SelectItem>
                        </SelectContent>
                      </Select>
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
              </li>
            </AnimatePresence>
          );
        })}
      </ul>
    );
  }
);

export default MessageList;
