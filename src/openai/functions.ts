import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonController } from "../ableton/controller";

const controller = new AbletonController();
const { Application, Track, Device, ClipSlot, Clip, Song } = AbletonController;

export const functionMap: Record<string, Function> = {
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
};

const functionDefinitions: Record<string, FunctionDefinition> = {
  [Application.GetVersion.name]: AbletonController.Application.GetVersion,
  [Application.Test.name]: AbletonController.Application.Test,
  [Application.Reload.name]: AbletonController.Application.Reload,
  [Application.GetLogLevel.name]: AbletonController.Application.GetLogLevel,
  [Application.SetLogLevel.name]: AbletonController.Application.SetLogLevel,

  [Track.StopAllClips.name]: AbletonController.Track.StopAllClips,
  [Track.Mute.name]: AbletonController.Track.Mute,
  [Track.Solo.name]: AbletonController.Track.Solo,
  [Track.Arm.name]: AbletonController.Track.Arm,

  [Device.GetName.name]: AbletonController.Device.GetName,
  [Device.SetParameter.name]: AbletonController.Device.SetParameter,

  [ClipSlot.CreateClip.name]: AbletonController.ClipSlot.CreateClip,
  [ClipSlot.DeleteClip.name]: AbletonController.ClipSlot.DeleteClip,

  [Clip.Fire.name]: AbletonController.Clip.Fire,
  [Clip.Stop.name]: AbletonController.Clip.Stop,
  [Clip.SetName.name]: AbletonController.Clip.SetName,

  [Song.StartPlaying.name]: AbletonController.Song.StartPlaying,
  [Song.StopPlaying.name]: AbletonController.Song.StopPlaying,
  [Song.SetTempo.name]: AbletonController.Song.SetTempo,
  [Song.NextCue.name]: AbletonController.Song.NextCue,
  [Song.PrevCue.name]: AbletonController.Song.PrevCue,

  [Application.GetVersion.name]: AbletonController.Application.GetVersion,
  [Application.Test.name]: AbletonController.Application.Test,
  [Application.Reload.name]: AbletonController.Application.Reload,
  [Application.GetLogLevel.name]: AbletonController.Application.GetLogLevel,
  [Application.SetLogLevel.name]: AbletonController.Application.SetLogLevel,
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should have all function definitions", () => {
    expect(Object.keys(functionMap)).toEqual(Object.keys(functionDefinitions));
  });
}
