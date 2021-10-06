const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");
const path = require("path");

function build() {
  /*Command to get a static build of your app after transpilation.

    Raises
    ------
    FileNotFoundError
        If config.json file doesn't exist.
  */

  config_file = CONSTANTS.CONFIG_FILE_NAME;
  config_settings = new Config(config_file, (load = true));

  // transpiler = Transpiler(
  //   config_settings.get_config(),
  //   (props_map = CONSTANTS.PROPS_MAP),
  //   (verbose = True)
  // );
  // transpiler.transpile_project();

  dest_dir = config_settings.get("dest_dir");
  // npm.build(dest_dir);

  //Move build folder to project_dir instead of dest_dir
  npm_build = path.join(dest_dir, "build");
  project_build = path.join(".", "build");
  fs.rename(npm_build, project_build, (error) => {
    if (error) {
      console.log("There is an error", error);
    }
  });
}

module.exports = build;
