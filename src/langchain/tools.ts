import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";

const setTempoTool = new DynamicStructuredTool({
  name: "set_tempo",
  description: "Sets the BPM of the song",
  schema: z.object({
    bpm: z.number().min(1).max(300),
  }),
  async func(input, runManager) {
    logger.info(`Setting tempo to ${input.bpm}`);
    await controller.song.setTempo(input.bpm);
    return "Tempo set!";
  },
});

export const tools = [setTempoTool];
