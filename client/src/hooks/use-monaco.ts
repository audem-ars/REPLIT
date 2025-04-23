import { useState, useCallback, useEffect } from "react";
import { monacoLanguages } from "@/lib/languages";

export function useMonaco() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Monaco editor into window object
  useEffect(() => {
    if (window.monaco) {
      setIsLoading(false);
      return;
    }

    // Setup Monaco loader
    if (window.require) {
      window.require.config({
        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs" }
      });

      window.require(["vs/editor/editor.main"], () => {
        setIsLoading(false);
      });
    } else {
      const interval = setInterval(() => {
        if (window.require) {
          clearInterval(interval);
          window.require.config({
            paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs" }
          });

          window.require(["vs/editor/editor.main"], () => {
            setIsLoading(false);
          });
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  // Initialize Monaco editor instance
  const initMonaco = useCallback(async (container: HTMLElement) => {
    if (!window.monaco) {
      throw new Error("Monaco editor not loaded");
    }

    // Configure Monaco editor
    const editor = window.monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: {
        enabled: true
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'Fira Code', monospace",
      lineNumbers: "on",
      renderLineHighlight: "all",
      scrollbar: {
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    });

    setIsInitialized(true);
    return editor;
  }, []);

  return {
    isLoading: isLoading || !window.monaco,
    isInitialized,
    initMonaco
  };
}
