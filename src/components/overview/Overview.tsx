import useChatHistory from "@/lib/hooks/useChatHistory";
import React from "react";
import ChatOverview from "./ChatOverview";
import OverviewLatex from "./OverviewLatex";

function Overview() {
  const [chats] = useChatHistory();

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {chats.map((chat) => (
          <ChatOverview key={chat.id} chat={chat} />
        ))}
      </div>

      <OverviewLatex />
    </div>
  );
}

export default Overview;
