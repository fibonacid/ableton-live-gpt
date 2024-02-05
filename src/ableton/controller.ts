import { ApplicationAPI } from "./apis/application";
import { ClipAPI } from "./apis/clip";
import { ClipSlotAPI } from "./apis/clip-slot";
import { DeviceAPI } from "./apis/device";
import { SongAPI } from "./apis/song";
import { TrackAPI } from "./apis/track";
import { AbletonBus } from "./bus";

export class AbletonController {
  private bus = new AbletonBus();

  // Static links to APIs
  static Application = ApplicationAPI;
  static Track = TrackAPI;
  static ClipSlot = ClipSlotAPI;
  static Clip = ClipAPI;
  static Device = DeviceAPI;
  static Song = SongAPI;

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

export const controller = new AbletonController();
