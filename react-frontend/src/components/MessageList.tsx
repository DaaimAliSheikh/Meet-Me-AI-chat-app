import { ConversationType } from "@/types";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import { useUserStore } from "@/store";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

import { AnimatePresence } from "framer-motion";
import MessageDropdown from "./MessageDropdown";
import { useInView } from "react-intersection-observer";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";
import cld from "@/cloudinary.config";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
interface ListItemProps {
  currentConvo: ConversationType;
  elementRef: React.RefObject<HTMLDivElement>;
}

const MessageList = ({ currentConvo, elementRef }: ListItemProps) => {
  const userId = useUserStore((state) => state.user?._id);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (elementRef.current && inView) {
      elementRef.current.scrollIntoView(false);
    }
    ///if already scrolled to bottom then scroll more when message received
  }, [currentConvo]);

  return (
    <ul className="flex flex-col px-1">
      <AnimatePresence mode="popLayout">
        {currentConvo.messages.map((message) => {
          let messageImage;
          if (message.public_id)
            messageImage = cld.image(message.public_id).quality("auto");

          return (
            <motion.li
              layout
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
                      ].find((user) => user._id === message.senderId)?.image ||
                      ""
                    }
                  />
                  <AvatarFallback className="text-sm">
                    {message.senderId === "assistant"
                      ? "M"
                      : generateInitials(
                          [
                            ...currentConvo.admins,
                            ...currentConvo.participants,
                          ].find((user) => user._id === message.senderId)
                            ?.username
                        )}
                  </AvatarFallback>
                </Avatar>
              )}

              {
                <Card
                  className={` ${message.senderId !== userId && "bg-primary "}
                  
                  
                  p-2 flex flex-col gap-1 w-full `}
                >
                  <div className="flex gap-2 justify-between items-start">
                    <div>
                      <p className="text-xs font-bold">
                        {message.senderId === "assistant"
                          ? "Meet-Me AI ✨"
                          : [
                              ...currentConvo.admins,
                              ...currentConvo.participants,
                            ].find((user) => user._id === message.senderId)
                              ?.username}
                      </p>
                      {message.edited && (
                        <div className="flex gap-1 text-xs">
                          <p className=" w-[3px] h-[5] bg-secondary"></p>
                          <p
                            className={
                              message.senderId === userId
                                ? "text-muted-foreground"
                                : "text-secondary"
                            }
                          >
                            edited
                          </p>
                        </div>
                      )}
                    </div>

                    {message.senderId === userId && (
                      <MessageDropdown
                        message={message}
                        currentConvo={currentConvo}
                      />
                    )}
                  </div>
                  <p className="w-full text-xs">{message.message}</p>
                  {message.image && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <AdvancedImage
                          cldImg={messageImage!}
                          plugins={[responsive()]}
                          className="w-40 h-40 mx-auto md:w-60 md:h-60 object-contain hover:cursor-pointer"
                          alt="message image"
                        />
                      </DialogTrigger>
                      <DialogContent className="px-1">
                        <DialogHeader>
                          <DialogTitle>
                            {
                              [
                                ...currentConvo.admins,
                                ...currentConvo.participants,
                              ].find((user) => user._id === message.senderId)
                                ?.username
                            }
                          </DialogTitle>
                          <DialogDescription>
                            {message.message}
                          </DialogDescription>
                          <AdvancedImage
                            cldImg={messageImage!}
                            plugins={[
                              responsive(),
                              placeholder({ mode: "blur" }),
                            ]}
                            className="w-full object-contain"
                            alt="message image"
                          />
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
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
              }
            </motion.li>
          );
        })}
      </AnimatePresence>

      <div ref={ref}></div>
    </ul>
  );
};

export default MessageList;
