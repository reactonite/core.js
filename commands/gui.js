const conf = new (require("conf"))();
const path = require("path");
const fs = require("fs");
const CONSTANTS = require("./requirements/Constants");
const Config = require("./requirements/Config");
const { create_dir, create_file } = require("./requirements/Helpers");
const fse = require("fs-extra");
const process = require("process");
const { Worker } = require("worker_threads");

function gui(project) {
  /*Command to start realtime development transpiler and GUI for Reactonite. It
    starts react development server and GUI in a seperate thread as well and
    watches for changes in project directory and transpiles codebase.

    Parameters
    ----------
    project_name : str
        Name of the project to be created.

    Raises
    ------
    FileNotFoundError
        If config.json file doesn't exist
    RuntimeError
        If ReactJs development thread is not able to start
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

  if (fs.existsSync(project_dir)) {
    throw Error(
      "Invalid project name " + project + " directory already exists"
    );
  }

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
  config_settings.save_config();

  // Transpile once
  transpiler = Transpiler(
    config_settings.get_config(),
    (props_map = CONSTANTS.PROPS_MAP),
    (verbose = True),
    (create_project = True)
  );

  transpiler.transpile_project();

  process.chdir(project_dir);
  src_dir = CONSTANTS.SRC_DIR;
  fs.readdir(src_dir, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    files.forEach(function (file) {
      fs.unlink(file, function (err) {
        if (err) return console.log(err);
        console.log("file deleted successfully");
      });
    });
    console.log(files);
  });

  config_file_path = path.join(path.resolve("."), CONSTANTS.CONFIG_FILE_NAME);
  console.log(config_file_path);

  config_settings = new Config(config_file_path, (load = true));
  dest_dir = config_settings.get("dest_dir");

  npm = NodeWrapper();
  watcher = ReactoniteWatcher(config_settings.get_config());

  npm.install_grapesjs(path.resolve("."));

  try {
    const reactonite_thread = new Worker(npm.start, {
      workerData: { path: path.join(".", dest_dir) },
    });
    const grapesjs_thread = new Worker(npm.start_grapesjs, {
      workerData: { path: path.resolve(".") },
    });
    //  const flask_thread=new Worker(app.run, {
    //  workerData: { path: local-host,5000},
    //  flask_thread = Thread(target=app.run,
    //                           args=('localhost', 5000,))
    const watcher_thread = new Worker((target = watcher.start));
  } catch (e) {
    throw Error("Unable to start ReactJs development thread");
  }
}
module.exports = gui;
