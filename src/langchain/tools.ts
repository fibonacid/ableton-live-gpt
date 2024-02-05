import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicStructuredTool, DynamicTool } from "langchain/tools";
import { z } from "zod";

const getTempoTool = new DynamicTool({
  name: "get_tempo",
  description: "Calls the Song API to get the current bpm",
  async func() {
    const result = await controller.song.getTempo();
    const bpm = result.args[0];
    return `The bpm is ${bpm}`;
  },
});

const setTempoTool = new DynamicStructuredTool({
  name: "set_tempo",
  description: "Calls the Song API and sets the current tempo",
  schema: z.object({
    bpm: z.number().describe("The tempo in beats per minute (bpm)"),
  }),
  async func(input) {
    const result = await controller.song.setTempo(input.bpm);
    return `${result}`;
  },
});

const startPlayingTool = new DynamicTool({
  name: "start_playing",
  description: "Calls the Song API and starts session playback",
  async func() {
    const result = await controller.song.startPlaying();
    return `${result}`;
  },
});

const stopPlaying = new DynamicTool({
  name: "stop_playing",
  description: "Calls the Song API and stops session playback",
  async func() {
    const result = await controller.song.stopPlaying();
    return `${result}`;
  },
});

const continuePlaying = new DynamicTool({
  name: "continue_playing",
  description: "Resume session playback",
  async func() {
    try {
      await controller.song.continuePlaying();
      return "Playback session resumed";
    } catch (err) {
      logger.error(err);
      return "Failed to resume playback";
    }
  },
});

const isPlaying = new DynamicTool({
  name: "is_playing",
  description: "Query whether the song is currently playing",
  async func() {
    const result = await controller.song.isPlaying();
    const [check] = result.args;
    return check ? "Song is playing" : "Song is not playing";
  },
});

export const tools = [
  getTempoTool,
  setTempoTool,
  startPlayingTool,
  stopPlaying,
  continuePlaying,
  isPlaying,
];
