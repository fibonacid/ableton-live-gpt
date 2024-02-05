import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicTool } from "langchain/tools";

const setTempoTool = new DynamicTool({
  name: "setTempo",
  description: "Set the BPM of the song",
  func: async (input: string) => {
    console.log("input", input);
    const bpm = parseInt(input);
    logger.info(`Setting tempo to ${bpm} BPM`);
    try {
      await controller.song.setTempo(bpm);
      return `Tempo set to ${input} BPM`;
    } catch (e) {
      logger.error("Error setting tempo", JSON.stringify(e));
      return `Error setting tempo to ${input} BPM`;
    }
  },
});

export const tools = [setTempoTool];
