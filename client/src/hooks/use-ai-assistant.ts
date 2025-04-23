import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AICompletionResponse {
  completion: string;
}

interface AIExplanationResponse {
  explanation: string;
}

interface AIFixResponse {
  fixedCode: string;
}

interface AIDocumentationResponse {
  documentation: string;
}

interface CodeCompletionOptions {
  code: string;
  language: string;
  maxTokens?: number;
}

interface CodeExplanationOptions {
  code: string;
  language: string;
}

interface CodeFixOptions {
  code: string;
  error: string;
  language: string;
}

export function useAIAssistant() {
  // Generate code completion
  const completionMutation = useMutation({
    mutationFn: async (options: CodeCompletionOptions) => {
      const response = await apiRequest("/api/ai/complete", {
        method: "POST",
        body: JSON.stringify(options),
      });
      return response.completion as string;
    },
  });

  // Explain code
  const explainMutation = useMutation({
    mutationFn: async (options: CodeExplanationOptions) => {
      const response = await apiRequest("/api/ai/explain", {
        method: "POST",
        body: JSON.stringify(options),
      });
      return response.explanation as string;
    },
  });

  // Fix code
  const fixMutation = useMutation({
    mutationFn: async (options: CodeFixOptions) => {
      const response = await apiRequest("/api/ai/fix", {
        method: "POST",
        body: JSON.stringify(options),
      });
      return response.fixedCode as string;
    },
  });

  // Generate documentation
  const documentMutation = useMutation({
    mutationFn: async (options: CodeExplanationOptions) => {
      const response = await apiRequest("/api/ai/document", {
        method: "POST",
        body: JSON.stringify(options),
      });
      return response.documentation as string;
    },
  });

  return {
    generateCompletion: completionMutation.mutate,
    isCompletionLoading: completionMutation.isPending,
    completionError: completionMutation.error,
    completionResult: completionMutation.data,

    explainCode: explainMutation.mutate,
    isExplainLoading: explainMutation.isPending,
    explainError: explainMutation.error,
    explainResult: explainMutation.data,

    fixCode: fixMutation.mutate,
    isFixLoading: fixMutation.isPending,
    fixError: fixMutation.error,
    fixResult: fixMutation.data,

    generateDocumentation: documentMutation.mutate,
    isDocumentLoading: documentMutation.isPending,
    documentError: documentMutation.error,
    documentResult: documentMutation.data,
  };
}