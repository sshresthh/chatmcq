import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const vectorDB = {
  async initialize() {
    // Pinecone client is now initialized in the constructor, so we don't need to call init() anymore
    // This method can be used for any additional initialization if needed
  },

  async embed(content: string) {
    try {
      const vector = await getEmbedding(content);

      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      await index.upsert([
        { id: generateUniqueId(), values: vector, metadata: { content } },
      ]);

      return vector;
    } catch (error) {
      console.error("Error embedding content:", error);
      throw new Error("Failed to embed content");
    }
  },

  async search(query: string, topK: number = 5) {
    try {
      const queryVector = await getEmbedding(query);
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      const results = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
      });
      return results.matches || [];
    } catch (error) {
      console.error("Error searching vector database:", error);
      throw new Error("Failed to search vector database");
    }
  },

  async storeQuestions(content: string, questions: { question: string; answer: string }[]) {
    try {
      const vector = await getEmbedding(content);
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      await index.upsert([
        {
          id: generateUniqueId(),
          values: vector,
          metadata: { content, questions: JSON.stringify(questions) },
        },
      ]);
    } catch (error) {
      console.error("Error storing questions:", error);
      throw new Error("Failed to store questions");
    }
  },

  async searchQuestions(content: string): Promise<{ question: string; answer: string }[]> {
    try {
      const queryVector = await getEmbedding(content);
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      const results = await index.query({
        vector: queryVector,
        topK: 1,
        includeMetadata: true,
      });

      if (
        results.matches &&
        results.matches.length > 0 &&
        results.matches[0].metadata
      ) {
        const metadata = results.matches[0].metadata as { questions?: string };
        return metadata.questions ? JSON.parse(metadata.questions) : [];
      }
      return [];
    } catch (error) {
      console.error("Error searching questions:", error);
      throw new Error("Failed to search questions");
    }
  },
};

async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].embedding;
    } else {
      throw new Error("No embedding returned from OpenAI");
    }
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw new Error("Failed to get embedding");
  }
}

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
