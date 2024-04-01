export default class CodeCleaner {
  clean(rawResponse: string) {
    // Extract the Python function declaration from the raw response
    // The raw response may contain text before and after the function declaration
    // The function declaration may be split across multiple lines
    // Only return the code between start of the declaration (def) and the end of the declaration (indentation)
    const lines = rawResponse.split("\n");

    // Make sure we end with a newline, otherwise the last line might be ignored
    lines.push("");

    const start = lines.findIndex(
      (line) =>
        line.startsWith("def ") ||
        // Google Vertex AI likes to add a space before the def
        line.startsWith(" def ")
    );
    const end =
      lines.findIndex(
        (line, index) =>
          index > start &&
          ![" ", "\t"].includes(line[0]) &&
          line.trim().length > 0
      ) || lines.length;

    const linesBefore = lines.slice(0, start);
    const importStatements = linesBefore.filter(
      (line) => line.startsWith("import ") || line.startsWith("from ")
    );

    const functionLines = lines.slice(start, end);
    functionLines[0] = functionLines[0].trim(); // Remove space that Google Vertex AI likes to add

    const code = [...importStatements, ...functionLines].join("\n");

    return code;
  }
}
