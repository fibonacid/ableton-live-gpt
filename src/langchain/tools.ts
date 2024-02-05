import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicTool } from "langchain/tools";

const getTempoTool = new DynamicTool({
  name: "getTempo",
  description: "Calls the Song API to get the current bpm",
  async func() {
    logger.info("Calling API to get curent tempo");
    const tempo = await controller.song.getTempo();
    logger.info("Tempo is", tempo);
    return tempo;
  },
});

export const tools = [getTempoTool];
