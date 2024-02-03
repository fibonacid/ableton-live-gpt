export default class MaxAPI {
  static addHandler() {}
  static addHandlers() {}
  static removeHandler() {}
  static removeHandlers() {}
  static outlet() {}
  static outletBang() {}
  static post() {}
  static getDict() {}
  static setDict() {}
  static updateDict() {}
  static MESSAGE_TYPES = {
    ALL: "all",
    BANG: "bang",
    DICT: "dict",
    NUMBER: "number",
    LIST: "list",
  };
  static POST_LEVELS = {
    ERROR: "error",
    INFO: "info",
    WARN: "warn",
  };
}
