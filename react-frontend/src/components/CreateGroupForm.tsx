import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MembersList from "./MembersList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store";
import { useForm } from "react-hook-form";
import { toast } from "./ui/use-toast";
import { useDropzone } from "react-dropzone";

import api from "@/lib/api";
import {
  CreateGroupFormSchema,
  CreateGroupFormSchemaType,
} from "@/lib/CreateGroupFormSchema";
import { useEffect } from "react";
import { AdvancedImage } from "@cloudinary/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Loader2, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import cld from "@/cloudinary.config";

const CreateGroupForm = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const user = useUserStore((state) => state.user);

  const queryClient = useQueryClient();

  const form = useForm<CreateGroupFormSchemaType>({
    resolver: zodResolver(CreateGroupFormSchema),
    defaultValues: {
      name: "John Doe",
      description: "",
      participants: [] as string[],
      admins: [user?._id] as string[],
      image: [],
    },
  });

  useEffect(() => {
    form.register("image");
    return () => {
      form.unregister("image");
    };
  }, [form]);

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

  const onSubmit = async (data: CreateGroupFormSchemaType) => {
    // Convert the first array to a Set
    const set1 = new Set(data.participants);
    if (data.admins.some((item) => set1.has(item))) {
      toast({
        title: "A user cannot be both a participant and an admin",
        description: "Please choose different users",
        variant: "destructive",
      });
      return;
    }
    if (!data.admins.includes(user?._id as string)) {
      toast({
        title: "You must be an admin of your own group",
        description: "Please select yourself to be an admin",
        variant: "destructive",
      });
      return;
    }

    try {
      let image = "";
      let public_id = "";
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

      const conversation = await api.post(`/conversations/create`, {
        ...data,
        type: "group",
        image,
        public_id,
      });
      queryClient.setQueryData(["groups"], (oldData: any) => [
        ...JSON.parse(JSON.stringify(oldData)),
        {
          _id: conversation.data?._id,

          image: conversation.data?.image,
          name: conversation.data?.name,
        },
        ,
      ]);

      toast({
        title: "Group successfully created",
      });

      setOpen(false);
    } catch (e) {
      console.log(e);
      toast({
        title: "Group could not be created",
        variant: "destructive",
      });
      return;
    }
  };

  return (
    <ScrollArea className="h-[80vh] ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col md:w-[95%] pl-2 w-[95%] "
        >
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
                  <Input placeholder="Enter group description..." {...field} />
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
            {"Add your group photo (optional)"}
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
            <li className="text-red-500 text-sm">Selected too many files</li>
          )}

          <Tabs defaultValue="participants" className="w-full ">
            <h3 className="text-foreground text-md mt-2 mb-1">
              Select members
            </h3>

            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
            </TabsList>

            <TabsContent value="participants">
              <ScrollArea className="  h-[18vh] ">
                <ul className="w-full">
                  <MembersList
                    members={[]}
                    form={form}
                    isAdmin={true}
                    name="participants"
                  />
                </ul>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="admins">
              <ScrollArea className=" h-[18vh] ">
                <ul className=" w-full">
                  <MembersList
                    members={[
                      {
                        username: user?.username!,
                        _id: user?._id!,
                        image: user?.image!,
                      },
                    ]}
                    form={form}
                    isAdmin={true}
                    name="admins"
                  />
                </ul>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <AdvancedImage cldImg={cld.image()} />
          <Button disabled={form.formState.isSubmitting} size={"sm"}>
            Create group{" "}
            {form.formState.isSubmitting && (
              <Loader2 className="ml-1 animate-spin" />
            )}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  );
};

export default CreateGroupForm;
