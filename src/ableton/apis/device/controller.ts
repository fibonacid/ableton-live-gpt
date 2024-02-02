import { AbletonBus } from "../../bus";

export class DeviceAPI {
  constructor(private bus: AbletonBus) {}

  /** Get device name */
  async getName(trackId: number, deviceId: number) {
    return this.bus.sendAndReturn("/live/device/get/name", [trackId, deviceId]);
  }

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

  /** Turn device on/off */
  async setDeviceOnOff(trackId: number, deviceId: number, onOff: number) {
    return this.bus.sendAndReturn("/live/device/on_off", [
      trackId,
      deviceId,
      onOff,
    ]);
  }
}
