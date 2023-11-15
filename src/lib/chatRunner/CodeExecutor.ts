import { Challenge, TestCaseResult } from "../types";

export default class CodeExecutor {
  private static instance: CodeExecutor;
  static getInstance() {
    if (!CodeExecutor.instance) {
      CodeExecutor.instance = new CodeExecutor();
    }
    return CodeExecutor.instance;
  }

  constructor() {
    if (CodeExecutor.instance) {
      throw new Error("Singleton class. Use CodeExecutor.getInstance()");
    }
  }

  private async loadPyodide() {
    const pyodideWorker = new Worker("/webworker.js");
    const callbacks: { [id: number]: (data: any) => void } = {};
    const errorCallbacks: { [id: number]: (data: any) => void } = {};

    pyodideWorker.onmessage = (event: any) => {
      const { id, ...data } = event.data;
      const onSuccess = callbacks[id];
      const onError = errorCallbacks[id];
      delete callbacks[id];
      console.log("CodeExecutor Message:", data);

      if (data.error) {
        onError(data.error);
        return;
      }
      onSuccess("");
    };
    pyodideWorker.onerror = (event: any) => {
      console.log("CodeExecutor Error:", event);
    };

    const asyncRun = (() => {
      let id = 0; // identify a Promise
      return (script: string, context?: any) => {
        // the id could be generated more carefully
        id = (id + 1) % Number.MAX_SAFE_INTEGER;
        return new Promise<any>((onSuccess, onError) => {
          callbacks[id] = onSuccess;
          errorCallbacks[id] = onError;
          pyodideWorker.postMessage({
            ...context,
            python: script,
            id,
          });
        });
      };
    })();

    return asyncRun;
  }

  async passesTests(
    challenge: Challenge,
    code: string
  ): Promise<TestCaseResult[]> {
    if (code.includes("def __init__(")) {
      // LLAMA loves to override __init__ and it breaks everything
      return [
        {
          name: "def __init__",
          status: "error",
          output: "Environment does not support overriding __init__",
        },
      ];
    }

    const runPyodide = await this.loadPyodide();
    if (!runPyodide) throw new Error("Pyodide not loaded");

    let testResults: TestCaseResult[] = [];
    const { testCode } = challenge;

    // Run setup code
    await runPyodide(testCode.setupCode);

    await Promise.all(
      testCode.testList.map(async (testCase) => {
        const testCode = `${code}\n${testCase}`;

        try {
          const output = await runPyodide(testCode);

          testResults.push({
            name: testCase,
            status: "success",
            output: output,
          });
        } catch (error: any) {
          console.log("CodeEcecutor Error:", challenge.name, code, error);

          let errorStatus = "error";
          if (error.message.includes("SyntaxError")) {
            errorStatus = "SyntaxError";
          }
          if (error.message.includes("AssertionError")) {
            errorStatus = "AssertionError";
          }

          testResults.push({
            name: testCase,
            status: errorStatus as any,
            output: error.message,
          });

          return false;
        }
      })
    );

    return testResults;
  }
}
