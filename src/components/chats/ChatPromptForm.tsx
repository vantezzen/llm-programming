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
import { DataSet, DataSets, Model, Models } from "@/lib/types";
import { Slider } from "../ui/slider";
import DatasetManager from "@/lib/chatRunner/DatasetManager";
import { MultiSelect } from "../ui/multi-select";
import TemplatePreview from "./TemplatePreview";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useDebounce } from "usehooks-ts";

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

  // Store and debounce prompt locally to speed up rendering
  const [prompt, setPrompt] = useState(currentChat?.prompt ?? "");
  const debouncedPrompt = useDebounce<string>(prompt, 500);
  useEffect(() => {
    if (currentChat?.prompt === prompt) return;
    setCurrentChat({ ...currentChat!, prompt: debouncedPrompt });
  }, [debouncedPrompt]);
  useEffect(() => {
    if (currentChat?.prompt === prompt) return;
    setPrompt(currentChat?.prompt ?? "");
  }, [currentChat?.id]);

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="w-full col-span-2">
          <Textarea
            placeholder="Type your prompt here."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-full"
          />

          <p className="text-xs font-medium text-zinc-400">
            Placeholders: "[task]", "[shots(num)]" (e.g. "[shots(3)]"),
            "[tests]", "[head]", "[libraries]" (array).
            <br />
            You may also include any code (e.g. "[task.replace('a', 'b')]")
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

            <MultiSelect
              options={
                Models.map((model) => ({
                  label: model,
                  value: model,
                })) ?? []
              }
              selected={currentChat?.requestedModels ?? []}
              onChange={(value) => {
                setCurrentChat({
                  ...currentChat!,
                  requestedModels: value as Model[],
                });
              }}
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <p className="text-zinc-500 font-medium text-sm whitespace-nowrap">
              {currentChat?.challengeLimit === -1
                ? challengeAmount
                : currentChat?.challengeLimit}{" "}
              challenges
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

          <div className="flex items-center gap-3 pb-2 justify-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="addHeadSwitch"
                checked={currentChat?.addHead ?? false}
                onCheckedChange={(value) => {
                  setCurrentChat({ ...currentChat!, addHead: value });
                }}
              />
              <Label htmlFor="addHeadSwitch">Add head code</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <TemplatePreview />
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
    </div>
  );
}

export default ChatPromptForm;
