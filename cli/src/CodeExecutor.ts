import {
  type Challenge,
  type TestCaseResult,
  commonLibraries,
} from "../../src/lib/types";
import { join } from "node:path";
import { unlink } from "node:fs/promises";
import { v4 as uuid } from "uuid";
import { spawn } from "child_process";

export default class CodeExecutor {
  private runPython(file: string): Promise<string> {
    let output = "";

    return new Promise((resolve, reject) => {
      const python = spawn("python3", [file]);

      const timeout = setTimeout(() => {
        console.log("Python execution timed out");
        python.kill();
        reject("Python execution timed out");
      }, 5000);

      python.stdout.on("data", (data) => {
        output += data;
      });
      python.stderr.on("data", (data) => {
        console.log("Python Error:", data.toString());
        output += data;
      });
      python.on("error", (error) => {
        output += error;
        console.log("Python Error:", error);
        clearTimeout(timeout);
        reject(output);
      });

      python.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          console.log("Python exited with code", code);
          reject(output);
        }
      });
    });
  }

  async passesTests(
    challenge: Challenge,
    code: string
  ): Promise<TestCaseResult[]> {
    if (code.includes("def __init__(")) {
      // LLAMA loves to override __init__ and it breaks everything
      console.log("Environment does not support overriding __init__");
      return [
        {
          name: "def __init__",
          status: "error",
          output: "Environment does not support overriding __init__",
        },
      ];
    }

    let testResults: TestCaseResult[] = [];
    const { testCode } = challenge;

    await Promise.all(
      testCode.testList.map(async (testCase) => {
        let fullCode = "";
        // Import common libraries
        const libraryImports = commonLibraries
          .map((library) => `import ${library}`)
          .join("\n");
        fullCode += libraryImports + "\n";

        if (testCode.setupCode) {
          fullCode = testCode.setupCode + "\n";
        }
        fullCode += `${code}\n${testCase}`;

        const tmpFile = join(
          import.meta.dir,
          "/../../data/tmp",
          `tmp_${uuid()}.py`
        );
        Bun.write(tmpFile, fullCode);

        try {
          const output = await this.runPython(tmpFile);

          testResults.push({
            name: testCase,
            status: "success",
            output: output,
          });
        } catch (error: any) {
          console.log("CodeEcecutor Error:", error);

          let errorStatus = "error";
          if (typeof error === "string") {
            if (error.includes("SyntaxError")) {
              errorStatus = "SyntaxError";
            }
            if (error.includes("AssertionError")) {
              errorStatus = "AssertionError";
            }
          }

          testResults.push({
            name: testCase,
            status: errorStatus as any,
            output: error,
          });

          return false;
        } finally {
          // await unlink(tmpFile);
        }
      })
    );

    console.log(`Completed ${testResults.length} tests`);
    return testResults;
  }
}
