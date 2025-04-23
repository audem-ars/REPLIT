import { useState } from "react";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Lightbulb, 
  Bug, 
  FileText,
  AlertCircle, 
  Loader2 
} from "lucide-react";

interface AIAssistantPanelProps {
  code: string;
  language: string;
  onApplyFix?: (fixedCode: string) => void;
}

export function AIAssistantPanel({ 
  code, 
  language, 
  onApplyFix 
}: AIAssistantPanelProps) {
  const [error, setError] = useState("");
  const {
    generateCompletion,
    isCompletionLoading,
    completionResult,

    explainCode,
    isExplainLoading,
    explainResult,

    fixCode,
    isFixLoading,
    fixResult,

    generateDocumentation,
    isDocumentLoading,
    documentResult,
  } = useAIAssistant();

  const handleComplete = () => {
    generateCompletion({ code, language });
  };

  const handleExplain = () => {
    explainCode({ code, language });
  };

  const handleFix = () => {
    if (!error) {
      alert("Please enter an error message");
      return;
    }
    fixCode({ code, error, language });
  };

  const handleDocument = () => {
    generateDocumentation({ code, language });
  };

  const handleApplyFix = () => {
    if (fixResult && onApplyFix) {
      onApplyFix(fixResult);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-md overflow-hidden">
      <div className="p-4 bg-muted/50 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Assistant
        </h3>
      </div>
      <Tabs defaultValue="complete" className="flex-1">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="explain">Explain</TabsTrigger>
          <TabsTrigger value="fix">Fix</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
        </TabsList>
        
        <TabsContent value="complete" className="flex flex-col h-full p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Generate AI-powered code completions based on your current code.
          </p>
          <div className="flex-1 overflow-auto">
            {isCompletionLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : completionResult ? (
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {completionResult}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Completion" to get code suggestions
                  </p>
                </div>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <Button 
            onClick={handleComplete} 
            disabled={isCompletionLoading || !code}
            className="w-full"
          >
            {isCompletionLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Completion
          </Button>
        </TabsContent>
        
        <TabsContent value="explain" className="flex flex-col h-full p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Get an explanation of what your code does.
          </p>
          <div className="flex-1 overflow-auto">
            {isExplainLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : explainResult ? (
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm whitespace-pre-wrap">
                  {explainResult}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Explain Code" to get an explanation
                  </p>
                </div>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <Button 
            onClick={handleExplain} 
            disabled={isExplainLoading || !code}
            className="w-full"
          >
            {isExplainLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Explain Code
          </Button>
        </TabsContent>
        
        <TabsContent value="fix" className="flex flex-col h-full p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Fix errors in your code with AI assistance.
          </p>
          <Textarea
            placeholder="Paste error message here..."
            className="mb-4"
            value={error}
            onChange={(e) => setError(e.target.value)}
          />
          <div className="flex-1 overflow-auto">
            {isFixLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : fixResult ? (
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {fixResult}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Paste your error message and click "Fix Code"
                  </p>
                </div>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button 
              onClick={handleFix} 
              disabled={isFixLoading || !code || !error}
              className="flex-1"
            >
              {isFixLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Fix Code
            </Button>
            {fixResult && (
              <Button 
                onClick={handleApplyFix} 
                variant="secondary"
                className="flex-1"
              >
                Apply Fix
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="document" className="flex flex-col h-full p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Generate documentation for your code.
          </p>
          <div className="flex-1 overflow-auto">
            {isDocumentLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : documentResult ? (
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {documentResult}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Documentation" to add documentation to your code
                  </p>
                </div>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <Button 
            onClick={handleDocument} 
            disabled={isDocumentLoading || !code}
            className="w-full"
          >
            {isDocumentLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate Documentation
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}