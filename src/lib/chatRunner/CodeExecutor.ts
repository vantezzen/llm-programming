import { Challenge, TestCaseResult } from "../types";
import type { PyodideInterface } from "pyodide";

export default class CodeExecutor {
  private static instance: CodeExecutor;
  static getInstance() {
    if (!CodeExecutor.instance) {
      CodeExecutor.instance = new CodeExecutor();
    }
    return CodeExecutor.instance;
  }

  private pyodide: PyodideInterface | null = null;
  private pyodideReadyListeners: (() => void)[] = [];
  constructor() {
    if (CodeExecutor.instance) {
      throw new Error("Singleton class. Use CodeExecutor.getInstance()");
    }

    this.loadPyodide();
  }

  private async loadPyodide() {
    // Wait until window.loadPyodide is available
    while (!window.loadPyodide) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });
    this.pyodideReadyListeners.forEach((listener) => listener());
  }

  private async waitForPyodide() {
    if (this.pyodide) return;
    return new Promise<void>((resolve) => {
      this.pyodideReadyListeners.push(resolve);
    });
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

    await this.waitForPyodide();
    const { pyodide } = this;
    if (!pyodide) throw new Error("Pyodide not loaded");

    let testResults: TestCaseResult[] = [];
    const { testCode } = challenge;

    // Run setup code
    await pyodide.runPythonAsync(testCode.setupCode);

    await Promise.all(
      testCode.testList.map(async (testCase) => {
        const testCode = `${code}\n${testCase}`;

        try {
          const output = await pyodide.runPythonAsync(testCode);

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
