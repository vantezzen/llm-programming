export default class CodeCleaner {
  clean(rawResponse: string) {
    // Extract the Python function declaration from the raw response
    // The raw response may contain text before and after the function declaration
    // The function declaration may be split across multiple lines
    // Only return the code between start of the declaration (def) and the end of the declaration (indentation)
    const lines = rawResponse.split("\n");

    // Make sure we end with a newline, otherwise the last line might be ignored
    lines.push("");

    console.log("CodeCleaner Before", { rawResponse, lines });

    const start = lines.findIndex((line) => line.startsWith("def "));
    const end =
      lines.findIndex(
        (line, index) =>
          index > start &&
          ![" ", "\t"].includes(line[0]) &&
          line.trim().length > 0
      ) || lines.length;

    const code = lines.slice(start, end).join("\n");

    console.log("CodeCleaner", { rawResponse, code, lines });

    return code;
  }
}
