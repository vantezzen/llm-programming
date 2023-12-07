import { Chat } from "@/lib/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { getSuccessBackgroundColor } from "@/lib/color";

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
                <Progress
                  value={successRate * 100}
                  indicatorClassName={getSuccessBackgroundColor(successRate)}
                />
                <span className="text-gray-600 mt-2 text-sm font-medium">
                  {model.model}
                  <span className="font-bold ml-2">
                    {Math.round(successRate * 100)}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatOverview;
