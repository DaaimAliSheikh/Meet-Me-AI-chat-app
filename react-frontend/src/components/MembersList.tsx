import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generateInitials from "@/lib/generateInitials";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { useUserStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { ChatListUser } from "@/types";
import { Card } from "./ui/card";

const MembersList = ({
  members,
  form,
  isAdmin,
  name,
}: {
  members: ChatListUser[];
  form: UseFormReturn<
    {
      name: string;
      participants: string[];
      admins: string[];
      description?: string | undefined;
      image?: any;
    },
    any,
    undefined
  >;
  isAdmin: boolean;
  name: "participants" | "admins";
}) => {
  let allUsers:
    | {
        _id: string;
        username: string;
        image: string;
      }[]
    | undefined;

  if (isAdmin) {
    const user = useUserStore((state) => state.user) as {
      _id: string;
      username: string;
      image: string;
    };
    allUsers = useQueryClient().getQueryData(["users"]);
    if (allUsers)
      allUsers = [
        ...allUsers,
        {
          username: user?.username || "",
          _id: user?._id || "",
          image: user?.image || "",
        },
      ];
  } else {
    allUsers = members.map((member) => ({
      username: member?.username || "",
      _id: member?._id || "",
      image: member?.image || "",
    }));
  }

  if (allUsers?.length === 0)
    return (
      <h2 className="text-sm text-center text-muted-foreground my-[4vh]">
        No members
      </h2>
    );
  return allUsers?.map((user) => {
    return (
      <Card
        key={user?._id}
        className={`flex items-center text-sm p-1 gap-2 overflow-hidden w-full px-1 my-1  justify-between`}
      >
        {isAdmin && (
          <FormField
            key={user?._id}
            control={form.control}
            name={name}
            render={({ field }) => {
              return (
                <FormItem key={user?._id}>
                  <FormControl>
                    <Checkbox
                      defaultChecked={
                        !!members.find((member) => member._id === user._id)
                      }
                      checked={field.value?.includes(user?._id as never)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...field.value, user?._id])
                          : field.onChange(
                              field.value?.filter(
                                (value) => value !== user?._id
                              )
                            );
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
        )}
        <Avatar className={"h-7 w-7 m-1"}>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="text-sm">
            {generateInitials(user?.username)}
          </AvatarFallback>
        </Avatar>
        <h3 className=" text-sm w-full text-ellipsis whitespace-nowrap overflow-hidden">
          {user?.username}
        </h3>
      </Card>
    );
  });
};

export default MembersList;
