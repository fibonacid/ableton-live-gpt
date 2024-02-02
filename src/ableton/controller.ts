import { Logger } from "../logger";
import { SongAPI } from "./apis/song";
import { ApplicationAPI } from "./apis/application";
import { AbletonBus } from "./bus";
import { TrackAPI } from "./apis/track";
import { ClipSlotAPI } from "./apis/clip-slot";
import { ClipAPI } from "./apis/clip";
import { DeviceAPI } from "./apis/device";

export class AbletonController {
  private bus = new AbletonBus();

  // Application API
  application = new ApplicationAPI(this.bus);

  // Song API
  song = new SongAPI(this.bus);

  // Track API
  track = new TrackAPI(this.bus);

  // Clip Slot API
  clipSlot = new ClipSlotAPI(this.bus);

  // Clip API
  clip = new ClipAPI(this.bus);

  // Device API
  device = new DeviceAPI(this.bus);
}
