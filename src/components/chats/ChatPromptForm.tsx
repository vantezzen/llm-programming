import useCurrentChat from "@/lib/hooks/useCurrentChat";
import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { DataSet, DataSets } from "@/lib/types";
import ChatRunner from "@/lib/chatRunner/ChatRunner";

function ChatPromptForm({
  onStart,
  isRunning,
}: {
  onStart: () => void;
  isRunning: boolean;
}) {
  const [currentChat, setCurrentChat] = useCurrentChat();

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="w-full col-span-2">
          <Textarea
            placeholder="Type your prompt here."
            value={currentChat?.prompt}
            onChange={(e) =>
              setCurrentChat({ ...currentChat!, prompt: e.target.value })
            }
          />

          <p className="text-xs font-medium text-zinc-400">
            Use "[task]" as a placeholder for the task description.
          </p>
        </div>
        <div className="space-y-2">
          <Select
            value={currentChat?.dataset}
            onValueChange={(value) => {
              setCurrentChat({ ...currentChat!, dataset: value as DataSet });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Datasets</SelectLabel>
                {DataSets.map((dataset) => (
                  <SelectItem key={dataset} value={dataset}>
                    {dataset}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            type="submit"
            onClick={onStart}
            disabled={isRunning}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPromptForm;
