"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

export default function ExamPrepAISaaS() {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      alert("Please enter some text to generate questions.");
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Replace this with actual AI-based question generation
      const generatedQuestions = await simulateAIQuestionGeneration(text);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("An error occurred while generating questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [text]);

  const simulateAIQuestionGeneration = async (
    content: string
  ): Promise<Question[]> => {
    // This function simulates AI-generated questions based on user input
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing time

    const words = content.split(/\s+/);
    const questionCount = Math.min(
      5,
      Math.max(3, Math.floor(words.length / 30))
    );

    return Array.from({ length: questionCount }, (_, i) => ({
      id: i + 1,
      text: `What is the significance of "${
        words[(i * 30) % words.length]
      }" in the given context?`,
      options: [
        `It relates to ${words[(i * 30 + 5) % words.length]}`,
        `It exemplifies ${words[(i * 30 + 10) % words.length]}`,
        `It contrasts with ${words[(i * 30 + 15) % words.length]}`,
        `It defines ${words[(i * 30 + 20) % words.length]}`,
      ],
      correctAnswer: Math.floor(Math.random() * 4),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ExamPrep AI</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Questions</CardTitle>
          <CardDescription>
            Enter your study material to generate practice questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="study-text">Study Material</Label>
            <Textarea
              id="study-text"
              placeholder="Enter your study material here..."
              value={text}
              onChange={handleTextChange}
              className="min-h-[200px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Questions</CardTitle>
            <CardDescription>
              Answer the following questions based on the provided study
              material
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.map((question) => (
              <div key={question.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
                <RadioGroup>
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`q${question.id}-option${index}`}
                      />
                      <Label htmlFor={`q${question.id}-option${index}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
