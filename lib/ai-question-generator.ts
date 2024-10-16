import { OpenAI } from "openai";

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestions(content: string): Promise<Question[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates multiple-choice questions based on given content.",
      },
      {
        role: "user",
        content: `Generate 3 multiple-choice questions based on the following content. Each question should have 4 options. Format the output as a JSON array of objects, where each object represents a question with 'text', 'options' (array of strings), and 'correctAnswer' (index of the correct option) properties: ${content}`,
      },
    ],
    temperature: 0.7,
  });

  // Parse the response and convert it to the Question[] format
  const responseContent = response.choices[0].message.content;
  if (responseContent === null) {
    throw new Error("The response content is null");
  }
  return JSON.parse(responseContent);
}
