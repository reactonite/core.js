const props_map = require("./PropsMap");
class DEFAULTS {
  /*Default variables used in code execution

    Attributes
    ----------
    INIT_FILES_DIR : str
        Directory for initial files for setup.
    SRC_DIR : str
        Source directory for reactonite codebase.
    DEST_DIR : str
        Destination directory for React codebase.
    CONFIG_FILE_NAME : str
        Config file name for config variables.
    PROPS_MAP : dict
        Mapping for HTML to React props
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
