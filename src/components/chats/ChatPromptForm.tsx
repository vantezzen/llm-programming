import useCurrentChat from "@/lib/hooks/useCurrentChat";
import React, { useEffect, useState } from "react";
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
import { Slider } from "../ui/slider";
import DatasetManager from "@/lib/chatRunner/DatasetManager";

function ChatPromptForm({
  onStart,
  isRunning,
}: {
  onStart: () => void;
  isRunning: boolean;
}) {
  const [currentChat, setCurrentChat] = useCurrentChat();
  const [challengeAmount, setChallengeAmount] = useState(0);

  useEffect(() => {
    if (!currentChat?.dataset) return;

    const datasetManager = new DatasetManager(currentChat?.dataset);
    setChallengeAmount(datasetManager.getChallenges().length);
  }, [currentChat?.dataset]);

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
            Placeholders: "[task]", "[shots:num]" (e.g. "[shots:3]"), "[tests]"
          </p>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={currentChat?.dataset}
              onValueChange={(value) => {
                setCurrentChat({
                  ...currentChat!,
                  dataset: value as DataSet,
                  challengeLimit: -1,
                });
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
            <div className="flex items-center gap-3">
              <p className="text-zinc-500 font-medium text-sm">
                {currentChat?.challengeLimit === -1
                  ? challengeAmount
                  : currentChat?.challengeLimit}
              </p>

              <Slider
                max={challengeAmount}
                value={[
                  (currentChat?.challengeLimit === -1
                    ? challengeAmount
                    : currentChat?.challengeLimit) ?? 0,
                ]}
                onValueChange={(value) => {
                  const limit = value[0] === challengeAmount ? -1 : value[0];
                  setCurrentChat({ ...currentChat!, challengeLimit: limit });
                }}
              />
            </div>
          </div>
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
