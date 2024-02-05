import { controller } from "@/ableton/controller";
import { DynamicTool } from "langchain/tools";

const getTempoTool = new DynamicTool({
  name: "get_tempo",
  description: "Calls the Song API to get the current bpm",
  async func() {
    const result = await controller.song.getTempo();
    const bpm = result.args[0];
    return `The bpm is ${bpm}`;
  },
});

export const tools = [getTempoTool];
