const conf = new (require("conf"))();
const path = require("path");
const fs = require("fs");
const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");
const { create_dir, create_file } = require("./requirements/Helpers");
const fse = require("fs-extra");

function create_project(project) {
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

  project_dir = path.join(".", project);
  src_dir = path.join(project_dir, CONSTANTS.SRC_DIR);

  // Valid project name checks
  if (!(project.toLowerCase() == project)) {
    throw Error("Invalid project name " + project + " must be lower case.");
  }

  var regex = /^[0-9a-z]+$/;
  for (c in project) {
    ch = project[c];
    if (ch != "-" && !ch.match(regex)) {
      throw Error(
        "Invalid project name " +
          project +
          " only - is allowed as a special character."
      );
    }
  }

  // if (fs.existsSync(project_dir)) {
  //   throw Error(
  //     "Invalid project name " + project + " directory already exists"
  //   );
  // }

  config_file_path = path.join(project_dir, CONSTANTS.CONFIG_FILE_NAME);
  config_settings = new Config(config_file_path);
  config_settings.add_to_config("project_name", project);
  config_settings.add_to_config("src_dir", CONSTANTS.SRC_DIR);
  config_settings.add_to_config("dest_dir", CONSTANTS.DEST_DIR);

  // Create project directory
  create_dir(project_dir);
  create_dir(src_dir);

  // Initial setup of project/src directory
  package_path = path.dirname(__dirname); //CHECK!!! The __dirname variable always returns the absolute path of where your files live.
  init_src_dir_path = path.join(package_path, CONSTANTS.INIT_FILES_DIR);
  fse.copy(init_src_dir_path, src_dir);

  // Move .gitignore to outerlayer
  gitignore_src = path.join(".", src_dir, ".gitignore");
  gitignore_dest = path.join(".", project_dir, ".gitignore");
  setTimeout(function () {
    fs.rename(gitignore_src, gitignore_dest, (error) => {
      if (error) {
        console.log("There is an error", error);
      }
    });
  }, 1000);

  //Create template config.json in project dir
  //config_settings.save_config();

  //Transpile once
  // transpiler = Transpiler(
  //   config_settings.get_config(),
  //   (props_map = CONSTANTS.PROPS_MAP),
  //   (verbose = True),
  //   (create_project = True)
  // );

  // transpiler.transpile_project();
}

module.exports = create_project;
