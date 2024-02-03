import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";

export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const outputParser = new StringOutputParser();

export async function handler(text: string) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", "{input}"],
  ]);
  const chain = prompt.pipe(chatModel).pipe(outputParser);
  const response = await chain.invoke({
    input: text,
  });
  return response;
}
