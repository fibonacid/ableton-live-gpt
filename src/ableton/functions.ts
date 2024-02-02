import type { FunctionDefinition } from "openai/resources/shared.mjs";
import { applicationFunctions } from "./apis/application/functions";
import { deviceFunctions } from "./apis/device/functions";
import { clipSlotFunctions } from "./apis/clip-slot/functions";
import { clipFunctions } from "./apis/clip/functions";
import { songFunctions } from "./apis/song/functions";
import { trackFunctions } from "./apis/track/functions";

export const abletonFunctions: FunctionDefinition[] = [
  ...applicationFunctions,
  ...deviceFunctions,
  ...clipFunctions,
  ...clipSlotFunctions,
  ...songFunctions,
  ...trackFunctions,
];
