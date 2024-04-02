import useChats from "@/lib/ChatContext";
import { Models } from "@/lib/types";
import React from "react";

function OverviewLatex() {
  const chats = useChats();
  const chatResults: { [key: string]: number[] } = Object.fromEntries(
    Models.map((model) => [model, []])
  );
  for (const chat of chats) {
    for (const model of chat.models) {
      const modelName = model.model;

      const successRate =
        model.challenges.filter((challenge) => challenge.success).length /
        model.challenges.length;

      chatResults[modelName].push(successRate);
    }
  }

  const latex = `\\begin{table}[h!]
  \\centering
  \\begin{tabular}{||r r r r r||} 
       \\hline
       Model & ${chats.map((chat) => chat.name).join(" & ")} \\\\ [0.5ex]
       \\hline\\hline
       ${Object.entries(chatResults)
         .map(
           ([model, results]) =>
             `${model} & ${results
               .map((r) => {
                 const content = `${(r * 100).toFixed(0)}\\%`;
                 const isBiggest = Math.max(...results) === r;

                 return isBiggest ? `\\textbf{${content}}` : content;
               })
               .join(" & ")} \\\\`
         )
         .join("\n       ")}
       [0.5ex] 
       \\hline
  \\end{tabular}
  \\caption{MBPP Results}
  \\label{tab:results}
\\end{table}`;

  return (
    <div>
      <pre>{latex}</pre>
    </div>
  );
}

export default OverviewLatex;
