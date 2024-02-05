import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "langchain/tools";
import { controller } from "@/ableton/controller";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { AgentExecutor, AgentStep } from "langchain/agents";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import { RunnableSequence } from "langchain/runnables";
import { logger } from "@/logger";

/**
 * Define your chat model to use.
 */
const model = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0,
});

const setTempoTool = new DynamicTool({
  name: "setTempo",
  description: "Set the BPM of the song",
  func: async (input: string) => {
    const bpm = parseInt(input);
    logger.info(`Setting tempo to ${bpm} BPM`);
    await controller.song.setTempo(bpm);
    return `Tempo set to ${input} BPM`;
  },
});

const tools = [setTempoTool];

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a smart ableton live controller. You receive commands and execute them.",
  ],
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const modelWithFunctions = model.bind({
  functions: tools.map((tool) => convertToOpenAIFunction(tool)),
});

const runnableAgent = RunnableSequence.from([
  {
    input: (i: { input: string; steps: AgentStep[] }) => i.input,
    agent_scratchpad: (i: { input: string; steps: AgentStep[] }) =>
      formatToOpenAIFunctionMessages(i.steps),
  },
  prompt,
  modelWithFunctions,
  new OpenAIFunctionsAgentOutputParser(),
]);

export const executor = AgentExecutor.fromAgentAndTools({
  agent: runnableAgent,
  tools,
});
