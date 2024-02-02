import { AbletonController } from "../ableton/controller";

const controller = new AbletonController();
const { Application, Track, Device, ClipSlot, Clip, Song } = AbletonController;

export const functionMap = {
  [Application.GetVersion.name]: controller.application.getVersion,
  [Application.Test.name]: controller.application.test,
  [Application.Reload.name]: controller.application.reload,
  [Application.GetLogLevel.name]: controller.application.getLogLevel,
  [Application.SetLogLevel.name]: controller.application.setLogLevel,

  [Track.StopAllClips.name]: controller.track.stopAllClips,
  [Track.Mute.name]: controller.track.mute,
  [Track.Solo.name]: controller.track.solo,
  [Track.Arm.name]: controller.track.arm,

  [Device.GetName.name]: controller.device.getName,
  [Device.SetParameter.name]: controller.device.setParameter,

  [ClipSlot.CreateClip.name]: controller.clipSlot.createClip,
  [ClipSlot.DeleteClip.name]: controller.clipSlot.deleteClip,

  [Clip.Fire.name]: controller.clip.fire,
  [Clip.Stop.name]: controller.clip.stop,
  [Clip.SetName.name]: controller.clip.setName,

  [Song.StartPlaying.name]: controller.song.startPlaying,
  [Song.StopPlaying.name]: controller.song.stopPlaying,
  [Song.SetTempo.name]: controller.song.setTempo,
  [Song.NextCue.name]: controller.song.nextCue,
  [Song.PrevCue.name]: controller.song.prevCue,
} as const;

export type FunctionName = keyof typeof functionMap;
