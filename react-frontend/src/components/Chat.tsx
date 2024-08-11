import api from "@/lib/api";
import { useConvesationStore, useSocketStore, useUserStore } from "@/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import {
  ArrowLeft,
  Camera,
  EllipsisVertical,
  Loader2,
  Send,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConversationDetails from "./ConversationDetails";
import MessageList from "./MessageList";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { ConversationType, MessageType } from "@/types";
import { useInView } from "react-intersection-observer";

const Chat = ({
  setShowConvo,
}: {
  setShowConvo?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { conversation, setConversation } = useConvesationStore((state) => ({
    conversation: state.conversation,
    setConversation: state.setConversation,
  }));

  const userId = useUserStore((state) => state.user?._id);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView();

  const queryClient = useQueryClient();
  const socket = useSocketStore((state) => state.socket);

  const form = useForm({
    defaultValues: {
      message: "",
      image: [] as File[],
    },
  });
  useEffect(() => {
    form.register("image");
    return () => {
      form.unregister("image");
    };
  }, [form]);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      form.setValue("image", acceptedFiles, { shouldValidate: true });
      setImagePreview(true);
    },
  });

  const removeFile = (file: File) => () => {
    acceptedFiles.splice(acceptedFiles.indexOf(file), 1);
    form.setValue("image", acceptedFiles, { shouldValidate: true });
    setImagePreview(false);
  };

  const onSubmit = async (data: {
    message: string;
    image: File[] | undefined;
  }) => {
    const old: ConversationType = queryClient.getQueryData([
      conversation?._id,
    ])!;
    let public_id = "";
    let image = "";
    if (!data.image) {
      queryClient.setQueryData([conversation?._id], (oldData: any) => {
        return {
          ...oldData,
          messages: [
            ...oldData?.messages,
            {
              _id: Math.random() * 100,
              senderId: userId,
              conversationId: currentConvo._id,
              message: data.message,
              image,
              public_id,
              seenBy: [],
              edited: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
      });
      form.reset();

      try {
        const res = await api.post("/messages/send", {
          conversationId: currentConvo._id,
          message: data.message,
          image,
          public_id,
        });
        queryClient.setQueryData([conversation?._id], () => {
          return {
            ...old,
            messages: [...old.messages, res.data], ///replace the optimistic with actual
          };
        });
      } catch {
        queryClient.setQueryData([conversation?._id], () => old);
      }
    } else {
      try {
        const signResponse = await api.get("/cloudinary");
        const signData = signResponse.data;
        const formData = new FormData();
        formData.append("file", data.image[0]);
        formData.append("api_key", signData.apikey);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", "meet-me");
        const cloudinary_url =
          "https://api.cloudinary.com/v1_1/" +
          signData.cloudname +
          "/auto/upload";
        const response = await fetch(cloudinary_url, {
          method: "POST",
          body: formData,
        });
        const result = JSON.parse(await response.text());
        image = result.url;
        public_id = result.public_id;
        const res = await api.post("/messages/send", {
          conversationId: currentConvo._id,
          message: data.message,
          image,
          public_id,
        });

        queryClient.setQueryData([conversation?._id], (oldData: any) => {
          return {
            ...oldData,
            messages: [...oldData?.messages, res.data],
          };
        });
        form.reset();
      } catch (e) {
        queryClient.setQueryData([conversation?._id], () => old);
      }
    }

    setImagePreview(false);
    form.setFocus("message");
    ///if already scrolled to bottom then scroll more when message received
  };

  ///data has ConversationType, with admins/participants populated with _id, username, image
  const { data: currentConvo, isFetching } = useQuery({
    queryKey: [conversation?._id],
    queryFn: async () => {
      try {
        ///user exited conversation  and invalidatequeries called, no conversation will be returned, reset current conversation

        if (conversation?.type === "group") {
          const groupResult = await api.get(
            `/conversations/${conversation?._id}`
          );
          return groupResult.data;
        }
      } catch (e) {
        setConversation(null);

        throw new Error("Conversation not found");
      }

      try {
        if (conversation?.type === "personal") {
          const UserResult = await api.get(
            `/conversations/personal/${conversation?._id}`
          );
          return UserResult.data;
        }
      } catch (error: any) {
        ///create new conversation if doesnt exist
        if (error.response.status === 400) {
          const result = await api.post("/conversations/create", {
            name: "personal",
            type: "personal",
            image: "",
            public_id: "",
            admins: [conversation?._id, userId], ///send own id and otherUserId
            participants: [],
          });
          return result.data;
        }
      }
    },
  });

  useEffect(() => {
    ///if already scrolled to bottom then scroll more when message received
    if (inView && elementRef.current) elementRef.current.scrollIntoView(false);
  }, [currentConvo]);

  useEffect(() => {
    const initializeChat = async () => {
      ///join this conversations room

      socket?.emit("join", currentConvo._id);

      socket?.on(
        "message-receive",
        async ({
          senderId,
          newMessage,
        }: {
          senderId: string;
          newMessage: MessageType;
        }) => {
          if (senderId !== userId) {
            queryClient.setQueryData([conversation?._id], (oldData: any) => {
              return {
                ...oldData,
                messages: [...oldData?.messages, newMessage],
              };
            });

            ///this api call will emit "seen" event which is handled below
            await api.put(`/messages/seen/${newMessage._id}`, {
              conversationId: currentConvo._id,
            });
          }
        }
      );
      socket?.on(
        "seen",
        ({
          messageId,
          seenUserId,
        }: {
          messageId: string;
          seenUserId: string;
        }) => {
          if (seenUserId !== userId)
            queryClient.setQueryData([conversation?._id], (oldData: any) => {
              return {
                ...oldData,
                messages: oldData?.messages.map((message: MessageType) => {
                  if (
                    message._id === messageId &&
                    !message.seenBy.includes(seenUserId!)
                  ) {
                    return {
                      ...message,
                      seenBy: [...message.seenBy, seenUserId],
                    };
                  }
                  return message;
                }),
              };
            });
        }
      );
      socket?.on("seen-all", ({ seenUserId }: { seenUserId: string }) => {
        if (seenUserId !== userId)
          queryClient.setQueryData([conversation?._id], (oldData: any) => {
            return {
              ...oldData,
              messages: oldData?.messages.map((message: MessageType) => {
                if (!message.seenBy.includes(seenUserId!)) {
                  return {
                    ...message,
                    seenBy: [...message.seenBy, seenUserId],
                  };
                }
                return message;
              }),
            };
          });
      });
      ///seen all messages of this conversation, emits seen-all event which is handled above
      await api.put(`/messages/seen-all/${currentConvo._id}`);
    };
    if (currentConvo) {
      initializeChat();
    }
    return () => {
      socket?.off("message-receive");
      socket?.off("seen");
      socket?.off("seen-all");
      socket?.off("message-receive");
      if (currentConvo) socket?.emit("leave", currentConvo._id);
    };
  }, [conversation, currentConvo]);

  useEffect(() => {
    form.setFocus("message");
    if (elementRef.current) elementRef.current.scrollIntoView(false);
  }, [isFetching]);

  ///extract conversation zustand and make useQuery according to that
  return isFetching ? (
    <Loader2 className="animate-spin mt-[30vh] mx-auto text-foreground" />
  ) : (
    <>
      <div className=" flex md:px-2 items-center bg-secondary rounded-lg py-1 ">
        {setShowConvo && (
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => setShowConvo(false)}
          >
            <ArrowLeft size={17} />
          </Button>
        )}
        <Avatar className={"my-1 w-8 h-8 border-foreground border-2"}>
          <AvatarImage
            src={
              currentConvo?.type === "group"
                ? currentConvo?.image || ""
                : conversation?.image || ""
            }
          />
          <AvatarFallback className="text-sm">
            {generateInitials(
              currentConvo?.type === "group"
                ? currentConvo?.name || ""
                : conversation?.name || ""
            )}
          </AvatarFallback>
        </Avatar>
        <h3 className="flex-grow pl-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {currentConvo?.type === "group"
            ? currentConvo?.name || ""
            : conversation?.name || ""}
        </h3>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <EllipsisVertical size={17} />
            </Button>
          </DialogTrigger>
          <DialogContent className="px-0 md:px-4">
            <DialogTitle className="text-center leading-6 mt-2">
              {currentConvo?.type === "group"
                ? currentConvo?.name || ""
                : conversation?.name || ""}
            </DialogTitle>
            <ConversationDetails
              setOpen={setOpen}
              setShowConvo={setShowConvo!}
              currentConvo={currentConvo}
            />
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-grow relative ">
        <div ref={elementRef}>
          {acceptedFiles.length > 0 && imagePreview && (
            <div className="w-full absolute flex items-center justify-center inset-0 transparent z-10 backdrop-blur-md">
              <div className="relative w-1/2 h-1/2 min-w-[18rem] ">
                <img
                  alt="post images"
                  src={URL.createObjectURL(acceptedFiles[0])}
                  className="w-full h-full  object-contain rounded-md"
                />
                <Button
                  type="button"
                  variant={"outline"}
                  size={"icon"}
                  className="p-0 absolute top-1 right-1 rounded-full w-8 h-8 ml-2"
                  onClick={removeFile(acceptedFiles[0])}
                  disabled={form.formState.isSubmitting}
                >
                  <X size={17} />
                </Button>
              </div>
            </div>
          )}

          {currentConvo && (
            <MessageList ref={ref} currentConvo={currentConvo} />
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-1 shadow-md  border-muted-foreground p-2"
      >
        <Button
          type="button"
          className="w-12"
          variant={"secondary"}
          size={"icon"}
          disabled={form.formState.isSubmitting}
        >
          <div
            {...getRootProps({
              className: "dropzone ",
            })}
          >
            <input id="media" {...getInputProps()} />
            <Camera size={20} />
          </div>
        </Button>
        <Input
          disabled={form.formState.isSubmitting}
          {...form.register("message", {
            required: acceptedFiles.length > 0 ? false : "Message is required",
          })}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-12"
          size={"icon"}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send size={17} />
          )}
        </Button>
      </form>
    </>
  );
};

export default Chat;
