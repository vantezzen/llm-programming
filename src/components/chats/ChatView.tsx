import useCurrentChat from "@/lib/hooks/useCurrentChat";
import React from "react";

import ChatPromptForm from "./ChatPromptForm";
import ChatModelResponse from "./ChatModelResponse";

function ChatView() {
  const currentChat = useCurrentChat();

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {currentChat?.models.map((model) => (
          <ChatModelResponse key={model.id} response={model} />
        ))}
      </div>

      <ChatPromptForm />
    </div>
  );
}

export default ChatView;
