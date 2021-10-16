const path = require("path");
const fs = require("fs");
const CONSTANTS = require("./Constants");
class ReactoniteWatcher {
  /*A file/directory watcher to report events incase
    they are modified/created/deleted.

    Attributes
    ----------
    src_dir : str
        Path of the source direectory to watch and report for events.
    dest_dir : str
        Path of the destination direectory to write transpiled code.
    config_settings : dict
        Path to src_dir and dest_dir as dict object, stored in config.json
    patterns : str, optional
        Pattern of files/directories to watch, defaults to "*"
    ignore_patterns : str, optional
        Pattern of files/directories to ignore or not watch, defaults to ""
    ignore_directories : bool, optional
        Parameter whether the watcher should ignore directories or
        not, defaults to False
    case sensitive : bool
        Parameter explaining whether file/directory names are
        case-sensitive or not, defaults to True
    recursive : bool
        Parameter whether the watcher should recursively watch
        inside directories or not, defaults to True
    */

  constructor(
    config_settings,
    patterns = "*",
    ignore_patterns = "",
    ignore_directories = false,
    case_sensitive = true,
    recursive = true
  ) {
    this.src_dir = config_settings["src_dir"];
    this.dest_dir = config_settings["dest_dir"];
    this.config_settings = config_settings;
    if (!fs.existsSync(path.join(".", this.src_dir))) {
      throw new Error(
        "Source directory doesn't exist at " + String(this.src_dir)
      );
    }
    if (!fs.existsSync(path.join(".", this.dest_dir))) {
      throw new Error(
        "Destination directory doesn't exist at " + String(this.dest_dir)
      );
    }
    this.patterns = patterns;
    this.ignore_patterns = ignore_patterns;
    this.ignore_directories = ignore_directories;
    this.case_sensitive = true;
    this.recursive = recursive;
    CONSTANTS = DEFAULTS();
    this.transpiler = Transpiler(
      config_settings,
      (props_map = CONSTANTS.PROPS_MAP),
      (verbose = true)
    );
  }
}
