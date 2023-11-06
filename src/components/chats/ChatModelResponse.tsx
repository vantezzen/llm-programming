import { ModelResponse } from "@/lib/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Check, Loader2, SquareCode, X } from "lucide-react";
import { Progress } from "../ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { cn } from "@/lib/utils";
import { getSuccessColor } from "@/lib/color";

function ChatModelResponse({ response }: { response: ModelResponse }) {
  const numSuccess = response.challenges.filter(
    (challenge) => challenge.status === "success"
  ).length;
  const numError = response.challenges.filter(
    (challenge) => challenge.status === "error"
  ).length;

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
        <CardTitle>{response.model}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-y-scroll h-64 mb-3" ref={scrollAreaRef}>
          <div className="grid gap-3">
            {response.challenges.map((challenge, i) => (
              <Collapsible key={i}>
                <CollapsibleTrigger>
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
                    <CollapsibleContent>
                      <SyntaxHighlighter
                        language="python"
                        style={atomOneDark}
                        wrapLongLines
                      >
                        {challenge.code}
                      </SyntaxHighlighter>
                    </CollapsibleContent>
                  </Alert>
                </CollapsibleTrigger>
              </Collapsible>
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
