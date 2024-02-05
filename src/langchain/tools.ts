import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicTool } from "langchain/tools";

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

export const tools = [setTempoTool];
