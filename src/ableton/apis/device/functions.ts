import type { FunctionDefinition } from "openai/resources/shared.mjs";

export const deviceFunctions: FunctionDefinition[] = [
  {
    name: "device.get_parameters",
    description: "Get the parameters of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  },
  {
    name: "device.get_parameter",
    description: "Get the value of a device parameter",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
      parameterIndex: {
        type: "number",
        description: "The index of the parameter in the device",
      },
    },
  },
  {
    name: "device.set_parameter",
    description: "Set the value of a device parameter",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
      parameterIndex: {
        type: "number",
        description: "The index of the parameter in the device",
      },
      value: {
        type: "number",
        description: "The value to set the parameter to",
      },
    },
  },
  {
    name: "device.get_parameter_name",
    description: "Get the name of a device parameter",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
      parameterIndex: {
        type: "number",
        description: "The index of the parameter in the device",
      },
    },
  },
  {
    name: "device.get_name",
    description: "Get the name of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  },
  {
    name: "device.get_on_off",
    description: "Get the on/off state of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  },
  {
    name: "device.set_on_off",
    description: "Set the on/off state of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
      onOff: {
        type: "number",
        description: "The on/off state to set the device to",
      },
    },
  },
  {
    name: "device.get_type",
    description: "Get the type of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  },
  {
    name: "device.get_bank_count",
    description: "Get the number of banks of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
    },
  },
  {
    name: "device.get_bank_parameters",
    description: "Get the parameters of a bank of a device",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to get the device from",
      },
      deviceIndex: {
        type: "number",
        description: "The index of the device in the track",
      },
      bankIndex: {
        type: "number",
        description: "The index of the bank in the device",
      },
    },
  },
];
