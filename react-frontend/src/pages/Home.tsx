import ChatList from "@/components/ChatList";
import ConversationBox from "../components/ConversationBox";

const Home = () => {
  return (
    <div className="flex-grow overflow-hidden flex gap-2 items-stretch  ">
      <ChatList />
      <ConversationBox />
    </div>
  );
};

export default Home;
