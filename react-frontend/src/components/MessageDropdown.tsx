import { ConversationType, MessageType } from "@/types";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";
import { useConvesationStore } from "@/store";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MessageDropdown = ({
  message,
  currentConvo,
}: {
  message: MessageType;
  currentConvo: ConversationType;
}) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { message: message.message },
  });
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const conversation = useConvesationStore((state) => state.conversation);

  const { mutate } = useMutation({
    mutationFn: async ({
      messageId,
      public_id,
    }: {
      messageId: string;
      public_id: string;
    }) => {
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="border">
          <ChevronDown size={15} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="hover:cursor-pointer my-1 hover:opacity-75 bg-destructive rounded-md"
            onClick={() => {
              mutate({
                messageId: message._id,
                public_id: message.public_id,
              });
            }}
          >
            Delete
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}
            className="hover:bg-secondary hover:cursor-pointer"
          >
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-4">Edit message</DialogTitle>
            <form
              onSubmit={handleSubmit(async (data) => {
                await api.put(`/messages/${message?._id}`, {
                  message: data.message,
                  conversationId: currentConvo._id,
                });
                queryClient.setQueryData(
                  [conversation?._id],
                  (oldData: any) => {
                    return {
                      ...oldData,
                      messages: oldData?.messages.map((msg: MessageType) =>
                        msg._id === message._id
                          ? {
                              ...msg,
                              message: data.message,
                              edited: true,
                            }
                          : msg
                      ),
                    };
                  }
                );
                setDialogOpen(false);
              })}
              className="flex gap-2"
            >
              <Input {...register("message")} />
              <Button type="submit" disabled={isSubmitting}>
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
    </>
  );
};

export default MessageDropdown;
