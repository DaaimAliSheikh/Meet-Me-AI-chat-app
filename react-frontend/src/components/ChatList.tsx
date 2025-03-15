import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersList from "./UsersList";
import GroupsList from "./GroupsList";

const ChatList = () => {
  return (
    <>
      <div className=" md:basis-[25%] h- px-1  h-full w-full  ">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">People</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersList />
          </TabsContent>
          <TabsContent value="groups">
            <GroupsList />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ChatList;
