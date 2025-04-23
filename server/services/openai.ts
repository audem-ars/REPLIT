import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CodeCompletionOptions {
  code: string;
  language: string;
  maxTokens?: number;
}

export interface CodeExplanationOptions {
  code: string;
  language: string;
}

export interface CodeFixOptions {
  code: string;
  error: string;
  language: string;
}

/**
 * Service to handle OpenAI API interactions
 */
export class OpenAIService {
  /**
   * Generate code completion suggestions
   */
  async generateCompletion({ code, language, maxTokens = 1024 }: CodeCompletionOptions): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI programming assistant embedded in a code editor. You will complete the code based on the context. 
            You will only provide the completion, not explanations. Use proper indentation and follow best practices for ${language}.`
          },
          {
            role: "user",
            content: code
          }
        ],
        max_tokens: maxTokens,
      });

      return response.choices[0].message.content || "";
    } catch (error: any) {
      console.error("Error generating completion:", error);
      throw new Error(`Failed to generate code completion: ${error.message}`);
    }
  }

  /**
   * Explain a piece of code
   */
  async explainCode({ code, language }: CodeExplanationOptions): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI programming assistant embedded in a code editor. 
            Explain the following ${language} code in a clear, concise way. 
            Focus on what the code does, any patterns or algorithms used, and potential issues.`
          },
          {
            role: "user",
            content: code
          }
        ],
      });

      return response.choices[0].message.content || "";
    } catch (error: any) {
      console.error("Error explaining code:", error);
      throw new Error(`Failed to generate code explanation: ${error.message}`);
    }
  }

  /**
   * Fix code based on an error message
   */
  async fixCode({ code, error, language }: CodeFixOptions): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI programming assistant embedded in a code editor. 
            Fix the following ${language} code that has an error. 
            Only return the fixed code with no explanations.
            Error message: ${error}`
          },
          {
            role: "user",
            content: code
          }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the JSON response to extract the fixed code
      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      return result.fixedCode || code;
    } catch (error: any) {
      console.error("Error fixing code:", error);
      throw new Error(`Failed to fix code: ${error.message}`);
    }
  }

  /**
   * Generate documentation for code
   */
  async generateDocumentation({ code, language }: CodeExplanationOptions): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI programming assistant embedded in a code editor. 
            Generate documentation for the following ${language} code. 
            Include function/class descriptions, parameters, return values, and example usage.
            Return the documentation in a format appropriate for ${language} (JSDoc for JavaScript/TypeScript, etc.).`
          },
          {
            role: "user",
            content: code
          }
        ],
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Error generating documentation:", error);
      throw new Error(`Failed to generate documentation: ${error.message}`);
    }
  }
}

export const openAIService = new OpenAIService();