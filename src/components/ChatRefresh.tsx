import React, { use } from "react";
import { Button } from "./ui/button";
import { RotateCw } from "lucide-react";
import { ChatContext } from "@/lib/ChatContext";

function ChatRefresh() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { setChatHistory } = use(ChatContext);

  return (
    <Button
      onClick={async () => {
        setIsLoading(true);
        const res = await fetch("/api/data");
        const data = await res.json();
        setChatHistory(data);
        setIsLoading(false);
      }}
      disabled={isLoading}
      variant="secondary"
      size="icon"
      className="ml-6"
    >
      <RotateCw size={16} className={isLoading ? "animate-spin" : ""} />
    </Button>
  );
}

export default ChatRefresh;
