const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");

function transpile_project(verbose) {
  /*Command for transpiling a Reactonite project built using
    create-project commandline.

    Parameters
    ----------
    verbose : bool, optional
        Verbosity of the command

    Raises
    ------
    FileNotFoundError
        If config.json file doesn't exist.
*/
  config_file = CONSTANTS.CONFIG_FILE_NAME;
  config_settings = new Config(config_file, (load = True));

  // transpiler = Transpiler(
  //     config_settings.get_config(),
  //     props_map=CONSTANTS.PROPS_MAP,
  //     verbose=verbose
  // )
  // transpiler.transpile_project()
}
module.exports = transpile_project;
