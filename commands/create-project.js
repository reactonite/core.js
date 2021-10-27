const path = require("path");
const fs = require("fs");
const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");
const { create_dir } = require("./requirements/Helpers");
const fse = require("fs-extra");

function create_project(project_name) {
  /*Command for creating new Reactonite project from scratch.

    Creates a new reactonite project with given PROJECT_NAME and installs npm
    packages along with basic directory structure layout.

    Parameters
    ----------
    project_name : str
        Name of the project to be created.

    Raises
    ------
    RuntimeError
        If project name is invalid.
    */

  project_dir = path.join(".", project_name);
  src_dir = path.join(project_dir, CONSTANTS.SRC_DIR);

  // Valid project name checks
  if (!(project.toLowerCase() == project_name)) {
    throw Error(
      "Invalid project name " + project_name + " must be lower case."
    );
  }

  var regex = /^[0-9a-z]+$/;
  for (c in project_name) {
    ch = project_name[c];
    if (ch != "-" && !ch.match(regex)) {
      throw Error(
        "Invalid project name " +
          project_name +
          " only - is allowed as a special character."
      );
    }
  }

  if (fs.existsSync(project_dir)) {
    throw Error(
      "Invalid project name " + project_name + " directory already exists"
    );
  }

  config_file_path = path.join(project_dir, CONSTANTS.CONFIG_FILE_NAME);
  config_settings = new Config(config_file_path);
  config_settings.add_to_config("project_name", project_name);
  config_settings.add_to_config("src_dir", CONSTANTS.SRC_DIR);
  config_settings.add_to_config("dest_dir", CONSTANTS.DEST_DIR);

  // Create project directory
  create_dir(project_dir);
  create_dir(src_dir);

  // Initial setup of project/src directory
  package_path = path.dirname(__dirname);
  init_src_dir_path = path.join(package_path, CONSTANTS.INIT_FILES_DIR);
  fse.copyFileSync(init_src_dir_path, src_dir);

  // Move .gitignore to outerlayer
  gitignore_src = path.join(".", src_dir, ".gitignore");
  gitignore_dest = path.join(".", project_dir, ".gitignore");
  fs.renameSync(gitignore_src, gitignore_dest);

  //Create template config.json in project dir
  config_settings.save_config();

  //Transpile once
  transpiler = new Transpiler(
    config_settings.get_config(),
    (props_map = CONSTANTS.PROPS_MAP),
    (verbose = true),
    (create_project = true)
  );

  transpiler.transpile_project();
}

module.exports = create_project;
