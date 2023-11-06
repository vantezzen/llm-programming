import type { loadPyodide, PyodideInterface } from "pyodide";

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}
