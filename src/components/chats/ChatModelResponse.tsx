import { ModelResponse } from "@/lib/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertTitle } from "../ui/alert";
import { Check, Loader2, SquareCode, Trash2, X } from "lucide-react";
import { Progress } from "../ui/progress";

import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { cn } from "@/lib/utils";
import { getSuccessColor } from "@/lib/color";
import { Button } from "../ui/button";
import useCurrentChat from "@/lib/hooks/useCurrentChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function ChatModelResponse({ response }: { response: ModelResponse }) {
  const numSuccess = response.challenges.filter(
    (challenge) => challenge.status === "success"
  ).length;
  const numError = response.challenges.filter(
    (challenge) => challenge.status === "error"
  ).length;

  const [currentChat, setCurrentChat] = useCurrentChat();

  const successRate = numSuccess / (numSuccess + numError);

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  if (scrollAreaRef.current) {
    scrollAreaRef.current.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between">
            {response.model}
            <Button
              size="icon"
              variant="destructive"
              onClick={() => {
                setCurrentChat({
                  ...currentChat!,
                  models: currentChat!.models.filter(
                    (modelReponse) => modelReponse.id !== response.id
                  ),
                });
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-y-scroll h-64 mb-3" ref={scrollAreaRef}>
          <div className="grid gap-3">
            {response.challenges.map((challenge, i) => (
              <Dialog key={i}>
                <DialogTrigger>
                  <Alert className="text-left">
                    {challenge.status === "generating" && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    {challenge.status === "executing" && (
                      <SquareCode size={16} />
                    )}
                    {challenge.status === "success" && (
                      <Check className="text-emerald-500" size={16} />
                    )}
                    {challenge.status === "error" && (
                      <X className="text-red-500" size={16} />
                    )}

                    <AlertTitle className="text-sm tracking-normal">
                      {challenge.name}
                    </AlertTitle>
                  </Alert>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw]">
                  <DialogHeader>
                    <DialogTitle>Run details</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="max-h-[80vh] overflow-auto grid gap-3">
                      <p className="font-bold">Code:</p>
                      <SyntaxHighlighter
                        language="python"
                        style={atomOneDark}
                        customStyle={{
                          borderRadius: "0.5rem",
                          padding: "1rem",
                          overflow: "auto",
                        }}
                      >
                        {challenge.code}
                      </SyntaxHighlighter>

                      <p className="font-bold">Raw:</p>

                      <SyntaxHighlighter
                        language="python"
                        style={atomOneDark}
                        customStyle={{
                          borderRadius: "0.5rem",
                          padding: "1rem",
                          overflow: "auto",
                        }}
                      >
                        {challenge.rawResponse}
                      </SyntaxHighlighter>
                    </div>

                    <div className="max-h-[80vh] overflow-auto">
                      <div className="grid gap-3">
                        {challenge.testCaseResults.map((testCaseResult, i) => (
                          <Alert
                            className={cn(
                              testCaseResult.status === "success"
                                ? "text-emerald-500"
                                : "text-red-500"
                            )}
                            key={i}
                          >
                            {testCaseResult.status === "success" && (
                              <Check className="text-emerald-500" size={16} />
                            )}
                            {testCaseResult.status === "error" && (
                              <X className="text-red-500" size={16} />
                            )}

                            <AlertTitle className="text-xs tracking-normal">
                              <b>{testCaseResult.status}</b>:{" "}
                              {testCaseResult.name}
                            </AlertTitle>

                            {testCaseResult.output && (
                              <SyntaxHighlighter
                                language="python"
                                style={atomOneDark}
                                wrapLongLines
                              >
                                {testCaseResult.output}
                              </SyntaxHighlighter>
                            )}
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        <Alert
          className={cn(
            "flex items-center gap-3",
            getSuccessColor(successRate)
          )}
        >
          <div>
            <Progress value={successRate * 100} className="w-12 h-3" />
          </div>

          <div>
            <AlertTitle>
              {Math.round(successRate * 100)}% success rate ({numSuccess} of{" "}
              {numError + numSuccess})
            </AlertTitle>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default ChatModelResponse;
