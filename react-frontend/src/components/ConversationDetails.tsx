import { ChatListUser, ConversationType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Loader2, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/lib/api";
import { useConvesationStore, useUserStore } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MembersList from "./MembersList";
import { useForm } from "react-hook-form";
import { toast } from "./ui/use-toast";
import {
  CreateGroupFormSchema,
  CreateGroupFormSchemaType,
} from "@/lib/CreateGroupFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone";
import { useEffect } from "react";

const ConversationDetails = ({
  currentConvo,
  setOpen,
  setShowConvo,
}: {
  currentConvo: ConversationType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConvo: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();
  const form = useForm<CreateGroupFormSchemaType>({
    resolver: zodResolver(CreateGroupFormSchema),
    defaultValues: {
      participants: currentConvo.participants.map(
        (participant) => participant._id
      ),
      admins: currentConvo.admins.map((admin) => admin._id),
      name: currentConvo.name,
      description: currentConvo.description,
      image: [],
    },
  });
  useEffect(() => {
    form.register("image");
    return () => {
      form.unregister("image");
    };
  }, [form]);

  const { isPending, mutate: deleteConversation } = useMutation({
    mutationFn: async ({
      conversationId,
      public_id,
    }: {
      conversationId: string;
      public_id: string;
    }) =>
      await api.patch(`/conversations/${conversationId}`, {
        public_id,
      }),

    onSuccess: () => {
      setConversation(null);

      currentConvo.type === "group"
        ? queryClient.invalidateQueries({ queryKey: ["groups"] })
        : queryClient.invalidateQueries({ queryKey: ["users"] });

      setConversation(null);
      toast({
        title: "Conversation deleted successfully",
      });
      setShowConvo && setShowConvo(false);
    },
    onError: (e) => {
      console.log(e);
      toast({
        title: "Could not delete converstation",
        variant: "destructive",
      });
    },
  });

  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpeg", ".jpg"],
        "image/gif": [".gif"],
        "image/webp": [".webp"],
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        form.setValue("image", acceptedFiles, { shouldValidate: true });
      },
    });

  const removeFile = (file: File) => () => {
    acceptedFiles.splice(acceptedFiles.indexOf(file), 1);
    form.setValue("image", acceptedFiles, { shouldValidate: true });
  };

  const user = useUserStore((state) => state.user);
  const { conversation, setConversation } = useConvesationStore((state) => ({
    conversation: state.conversation,
    setConversation: state.setConversation,
  }));

  const isAdmin = !!currentConvo?.admins?.find(
    (admin) => admin._id === user?._id
  );

  const onSubmit = async (data: CreateGroupFormSchemaType) => {
    const set1 = new Set(data.participants); // Convert the first array to a Set
    if (data.admins.some((item) => set1.has(item))) {
      toast({
        title: "A user cannot be both a participant and an admin",
        description: "Please choose different users",
        variant: "destructive",
      });
      return;
    }

    if (data.admins.length === 0) {
      toast({
        title: "There must atleast be one admin",
        variant: "destructive",
      });
      return;
    }

    try {
      let public_id = "";
      let image = "";
      if (data.image) {
        ///data.image is undefined(not empty array) in case of no image
        ///upload image
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

        //passing image the value here
      }

      await api.put(`/conversations/${currentConvo?._id}`, {
        ...data,
        type: "group",
        public_id,
        image,
        prev_public_id: currentConvo.public_id,
      });

      let allUsers = queryClient.getQueryData(["users"]) as ChatListUser[];
      allUsers = [
        ...allUsers,
        {
          username: user?.username!,
          _id: user?._id!,
          image: user?.image!,
        },
      ];

      queryClient.invalidateQueries({ queryKey: [conversation?._id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      ///if the admin leaves the group
      if (![...data.admins, ...data.participants].includes(user?._id!)) {
        toast({
          title: "You left the group",
        });
        setConversation(null);

        setShowConvo && setShowConvo(false);
      } else {
        toast({
          title: "Group successfully updated",
        });

        setOpen(false);
      }
    } catch (e) {
      console.log(e);
      toast({
        title: "Group could not be updated",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <ScrollArea
      className={`${
        conversation?.type === "group" && isAdmin && "h-[80vh]"
      }  md:w-full `}
    >
      <Avatar className={"my-4 mx-auto w-16 h-16 border-foreground border-2"}>
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
      {currentConvo.type === "group" ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex flex-col w-[95%] md:w-full pl-1  "
          >
            {isAdmin ? (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group name" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter group description..."
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  {...getRootProps({
                    className:
                      "dropzone w-full border-dashed text-sm text-center border p-5 flex justify-center items-center hover:cursor-pointer hover:bg-secondary hover:border-foreground",
                  })}
                >
                  {"Add a new group photo if you wish to replace the old one"}
                  <input id="media" {...getInputProps()} />
                </div>
                {acceptedFiles.length > 0 && (
                  <div className="relative mx-auto">
                    <img
                      alt="post images"
                      src={URL.createObjectURL(acceptedFiles[0])}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant={"outline"}
                      size={"icon"}
                      className="p-0 absolute top-1 right-1 rounded-full w-5 h-5 ml-2"
                      onClick={removeFile(acceptedFiles[0])}
                    >
                      <X size={17} />
                    </Button>
                  </div>
                )}

                {fileRejections.length > 0 && (
                  <li className="text-red-500 text-sm">
                    Selected too many files
                  </li>
                )}
              </>
            ) : (
              <>
                <p className="mx-auto text-xs text-muted-foreground my-2">
                  {currentConvo.description}
                </p>
              </>
            )}

            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
              </TabsList>
              <TabsContent value="participants">
                <ScrollArea className=" h-[18vh]">
                  <ul className="w-[94%] md:w-full">
                    <MembersList
                      members={currentConvo.participants}
                      form={form}
                      isAdmin={isAdmin}
                      name="participants"
                    />
                  </ul>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="admins">
                <ScrollArea className=" h-[18vh]">
                  <ul className="w-[94%] md:w-full">
                    <MembersList
                      members={currentConvo.admins}
                      form={form}
                      isAdmin={isAdmin}
                      name="admins"
                    />
                  </ul>
                </ScrollArea>
              </TabsContent>
            </Tabs>
            {isAdmin && (
              <Button
                disabled={form.formState.isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
                className="w-full flex gap-2 my-2 self-center"
              >
                Save changes
                {form.formState.isSubmitting && (
                  <Loader2 className="ml-1 animate-spin" />
                )}
              </Button>
            )}
          </form>
        </Form>
      ) : (
        <p className="text-sm text-center mb-2 text-muted-foreground">
          conversation started on{" "}
          {format(currentConvo?.createdAt as Date, "MMMM do, yyyy")}
        </p>
      )}

      <Button
        variant={"destructive"}
        disabled={isPending}
        type="button"
        className="flex gap-2 my-2 w-[95%] md:w-full ml-1"
        onClick={async () => {
          if (isAdmin) {
            deleteConversation({
              conversationId: currentConvo?._id,
              public_id: currentConvo?.public_id || "",
            });
          } else {
            await api.put(`/conversations/leave/${currentConvo?._id}`);
            setConversation(null);

            currentConvo.type === "group"
              ? queryClient.invalidateQueries({ queryKey: ["groups"] })
              : queryClient.invalidateQueries({ queryKey: ["users"] });

            queryClient.invalidateQueries({ queryKey: [conversation?._id] });
            toast({
              title: "You left this conversation",
            });
            setShowConvo && setShowConvo(false);
          }
        }}
      >
        <Trash2 />
        {isAdmin ? "Delete" : "Leave"}{" "}
        {currentConvo.type === "group" ? " group" : " conversation"}
        {isPending && <Loader2 className="ml-1 animate-spin" />}
      </Button>
    </ScrollArea>
  );
};

export default ConversationDetails;
