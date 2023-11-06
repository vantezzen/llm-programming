import { Challenge } from "../types";
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

  async passesTests(challenge: Challenge, code: string) {
    await this.waitForPyodide();
    const { pyodide } = this;
    if (!pyodide) throw new Error("Pyodide not loaded");

    const { testCode } = challenge;

    // Run setup code
    await pyodide.runPythonAsync(testCode.setupCode);

    const testResults = await Promise.all(
      testCode.testList.map(async (testCase) => {
        const testCode = `${code}\n${testCase}`;

        try {
          await pyodide.runPythonAsync(testCode);
          return true;
        } catch (error) {
          console.log("CodeEcecutor Error:", challenge.name, code, error);
          return false;
        }
      })
    );

    return testResults.every((result) => result);
  }
}
