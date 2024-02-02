import { Logger } from "../logger";
import { SongAPI } from "./apis/song/controller";
import { ApplicationAPI } from "./apis/application/controller";
import { AbletonBus } from "./bus";
import { TrackAPI } from "./apis/track/controller";
import { ClipSlotAPI } from "./apis/clip-slot/controller";
import { ClipAPI } from "./apis/clip/controller";
import { DeviceAPI } from "./apis/device/controller";

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
