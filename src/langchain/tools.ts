import { controller } from "@/ableton/controller";
import { logger } from "@/logger";
import { DynamicStructuredTool, DynamicTool } from "langchain/tools";
import { z } from "zod";

const getTempoTool = new DynamicTool({
  name: "get_tempo",
  description: "Queries the song tempo in beats per minute (bpm)",
  async func() {
    try {
      const result = await controller.song.getTempo();
      const [bpm] = result.args;
      return `Current tempo is ${bpm} bpm`;
    } catch (err) {
      logger.error(err);
      return "Failed to get tempo";
    }
  },
});

const setTempoTool = new DynamicStructuredTool({
  name: "set_tempo",
  description: "Calls the Song API and sets the current tempo",
  schema: z.object({
    bpm: z.number().describe("The tempo in beats per minute (bpm)"),
  }),
  async func(input) {
    const { bpm } = input;
    try {
      await controller.song.setTempo(bpm);
      return `Tempo set to ${bpm} bpm`;
    } catch (err) {
      logger.error(err);
      return "Failed to set tempo";
    }
  },
});

const startPlayingTool = new DynamicTool({
  name: "start_playing",
  description: "Start session playback ",
  async func() {
    try {
      await controller.song.startPlaying();
      return "Playback started";
    } catch (err) {
      logger.error(err);
      return "Failed to start playback";
    }
  },
});

const stopPlaying = new DynamicTool({
  name: "stop_playing",
  description: "Stop session playback",
  async func() {
    try {
      await controller.song.stopPlaying();
      return "Playback stopped";
    } catch (err) {
      logger.error(err);
      return "Failed to stop playback";
    }
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
    try {
      const result = await controller.song.isPlaying();
      const [check] = result.args;
      return check ? "Song is playing" : "Song is not playing";
    } catch (err) {
      logger.error(err);
      return "Failed to check if song is playing";
    }
  },
});

const captureMidi = new DynamicTool({
  name: "capture_midi",
  description: "Capture midi",
  async func() {
    try {
      await controller.song.captureMidi();
      return "Midi capture activated";
    } catch (err) {
      logger.error(err);
      return "Failed to activate midi capture";
    }
  },
});

export const tools = [
  getTempoTool,
  setTempoTool,
  startPlayingTool,
  stopPlaying,
  continuePlaying,
  isPlaying,
  captureMidi,
];
