import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Copy, Eye } from "lucide-react";
import useCurrentChat from "@/lib/hooks/useCurrentChat";
import PromptTemplate from "@/lib/chatRunner/PromptTemplate";
import DatasetManager from "@/lib/chatRunner/DatasetManager";
import { ScrollArea } from "../ui/scroll-area";

function TemplatePreview() {
  const [currentChat] = useCurrentChat();
  const [exampleOutput, setExampleOutput] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);

        if (!open && currentChat) {
          const promptTemplate = new PromptTemplate(currentChat);
          const datasetManager = new DatasetManager(currentChat.dataset);
          const dataset = datasetManager.getChallenges();
          const exampleChallenge = dataset[0];
          if (!exampleChallenge) return;

          const output = promptTemplate.renderPromptTemplate(exampleChallenge);
          setExampleOutput(output);
        }
      }}
    >
      <DialogTrigger>
        <Button size="icon" variant="secondary">
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preview Template</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96 rounded-lg relative">
          <Button
            className="absolute top-0 right-0 m-3"
            size="icon"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(exampleOutput)}
          >
            <Copy size={16} />
          </Button>

          <pre className="p-4 bg-gray-100 max-w-xl overflow-x-auto whitespace-pre-wrap">
            {exampleOutput}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatePreview;
