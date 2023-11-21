import { Chat } from "@/lib/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

function ChatOverview({ chat }: { chat: Chat }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{chat.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-5 gap-4">
          {chat.models.map((model) => {
            const numSuccess = model.challenges.filter(
              (challenge) => challenge.status === "success"
            ).length;
            const numError = model.challenges.filter(
              (challenge) => challenge.status === "error"
            ).length;

            const successRate = numSuccess / (numSuccess + numError);

            return (
              <div
                key={model.id}
                className="flex flex-col items-center space-x-2 gap-1 text-center"
              >
                <Progress value={successRate * 100} />
                <span className="text-gray-600 mt-2">{model.model}</span>
                <p className="text-sm">{successRate * 100}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatOverview;
