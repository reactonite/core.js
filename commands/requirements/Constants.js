const props_map = require("./PropsMap");
class DEFAULTS {
  /**
   * Default variables used in code execution
   *
   * @param {string} INIT_FILES_DIR Directory for initial files for setup.
   * @param {string} SRC_DIR Source directory for reactonite codebase.
   * @param {string} DEST_DIR Destination directory for React codebase.
   * @param {string} CONFIG_FILE_NAME Config file name for config variables.
   * @param {object} PROPS_MAP Mapping for HTML to React props
   */
  constructor() {
    this.INIT_FILES_DIR = "init_src_dir";
    this.SRC_DIR = "src";
    this.DEST_DIR = "dist";
    this.CONFIG_FILE_NAME = "config.json";
    this.PROPS_MAP = props_map;
  }
}
module.exports = new DEFAULTS();
