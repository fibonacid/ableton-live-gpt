import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class DeviceAPI {
  constructor(private bus: AbletonBus) {}

  /** Get device name */
  async getName(trackId: number, deviceId: number) {
    return this.bus.sendAndReturn("/live/device/get/name", [trackId, deviceId]);
  }
  static GetName: FunctionDefinition = {
    name: "device.get_name",
    description: "Get device name",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to get the device name from",
      },
      deviceId: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  };

  /** Set a device parameter value */
  async setParameter(
    trackId: number,
    deviceId: number,
    parameterIndex: number,
    value: number
  ) {
    return this.bus.sendAndReturn("/live/device/parameter", [
      trackId,
      deviceId,
      parameterIndex,
      value,
    ]);
  }
  static SetParameter: FunctionDefinition = {
    name: "device.set_parameter",
    description: "Set a device parameter value",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to set the device parameter in",
      },
      deviceId: {
        type: "number",
        description: "The index of the device in the track",
      },
      parameterIndex: {
        type: "number",
        description: "The index of the parameter in the device",
      },
      value: {
        type: "number",
        description: "The value to set",
      },
    },
  };

  /** Turn device on/off */
  async setDeviceOnOff(trackId: number, deviceId: number, onOff: number) {
    return this.bus.sendAndReturn("/live/device/on_off", [
      trackId,
      deviceId,
      onOff,
    ]);
  }
  static SetDeviceOnOff: FunctionDefinition = {
    name: "device.set_on_off",
    description: "Turn device on/off",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to set the device on/off in",
      },
      deviceId: {
        type: "number",
        description: "The index of the device in the track",
      },
      onOff: {
        type: "number",
        description: "The value to set",
      },
    },
  };
}
