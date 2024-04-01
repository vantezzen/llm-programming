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

function ChatPromptForm() {
  const currentChat = useCurrentChat();

  return (
    <div className="col-span-2 p-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="w-full col-span-2">
          <Textarea
            placeholder="Type your prompt here."
            value={currentChat?.prompt ?? ""}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default ChatPromptForm;
