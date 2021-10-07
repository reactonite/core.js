const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");
const { Worker } = require("worker_threads");

function start() {
  /*Command to start realtime development transpiler for Reactonite. It
    starts react development server in a seperate thread as well and watches
    for changes in project directory and transpiles codebase.

    Raises
    ------
    FileNotFoundError
        If config.json file doesn't exist
    RuntimeError
        If ReactJs development thread is not able to start
    */

  config_file = CONSTANTS.CONFIG_FILE_NAME;
  config_settings = Config(config_file, (load = true));
  dest_dir = config_settings.get("dest_dir");

  // Initial transpile
  // transpiler = Transpiler(
  //   config_settings.get_config(),
  //   (props_map = CONSTANTS.PROPS_MAP),
  //   (verbose = True)
  // );
  // transpiler.transpile_project();

  npm = NodeWrapper();
  watcher = ReactoniteWatcher(config_settings.get_config());

  try {
    const thread = new Worker(npm.start, {
      workerData: { path: path.join(".", dest_dir) },
    });
  } catch {
    throw new Error("Unable to start ReactJs development thread");
  }

  // Starting Watcher
  watcher.start();
}

module.exports = start;
