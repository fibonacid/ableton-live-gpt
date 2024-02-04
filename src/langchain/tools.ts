import { AbletonController } from "@/ableton/controller";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";

const controller = new AbletonController();

const setTempoTool = new DynamicStructuredTool({
  name: "set_tempo",
  description: "Sets the BPM of the song",
  schema: z.object({
    bpm: z.number().min(1).max(300),
  }),
  async func(input, runManager) {
    await controller.song.setTempo(input.bpm);
    return "Tempo set!";
  },
});

export const tools = [setTempoTool];
