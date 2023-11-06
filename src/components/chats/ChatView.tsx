import useCurrentChat from "@/lib/hooks/useCurrentChat";
import React, { useState } from "react";

import ChatPromptForm from "./ChatPromptForm";
import ChatModelResponse from "./ChatModelResponse";
import ChatRunner from "@/lib/chatRunner/ChatRunner";

function ChatView() {
  const [currentChat, setCurrentChat] = useCurrentChat();
  const [, forceUpdateState] = useState(0);
  const forceUpdate = () => forceUpdateState((n) => n + 1);

  const [chatRunner] = useState(() => new ChatRunner());
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {currentChat?.models.map((model) => (
          <ChatModelResponse key={model.model} response={model} />
        ))}
      </div>

      <ChatPromptForm
        onStart={() => {
          setIsRunning(true);
          chatRunner
            .runChat(currentChat!, () => {
              setCurrentChat(currentChat!);
              forceUpdate();
            })
            .then(() => {
              setIsRunning(false);
            });
        }}
        isRunning={isRunning}
      />
    </div>
  );
}

export default ChatView;
