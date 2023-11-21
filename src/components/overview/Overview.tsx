import useChatHistory from "@/lib/hooks/useChatHistory";
import React from "react";
import ChatOverview from "./ChatOverview";

function Overview() {
  const [chats] = useChatHistory();

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {chats.map((chat) => (
          <ChatOverview key={chat.id} chat={chat} />
        ))}
      </div>
    </div>
  );
}

export default Overview;
