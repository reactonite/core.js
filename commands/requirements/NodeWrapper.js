const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { cwd } = require("process");

class NodeWrapper {
  /*Node wrapper to execute commands corresponding to node js using python.

    Attributes
    ----------
    npx : str
        Commandline to be used for npx according to system(Linux, Windows)
    npm : str
        Commandline to be used for npm according to system(Linux, Windows)
    node : str
        Commandline to be used for node according to system(Linux, Windows)
  */

  constructor() {
    if (os.type == "Windows_NT") {
      this.npx = "npx.cmd";
      this.npm = "npm.cmd";
      this.node = "node.exe";
    } else {
      this.npx = "npx";
      this.npm = "npm";
      this.node = "node";
    }
    this.check_react_install();
  }

  run = function (cmd) {
    var child = exec(cmd, function (error, stdout, stderr) {
      if (stderr !== null && stderr.length != 0) {
        console.log("stderr is" + stderr);
      }
      if (error !== null) {
        console.log("error is" + error);
      }
    });
  };

  check_react_install() {
    /*Checks the installation of Nodejs/npm/npx. If npm is not
        available it throws an error.

        Raises
        ------
        RuntimeError
            Raised if Nodejs/npm/npx is not available.
    */

    try {
      this.run(this.npx + " --version");
    } catch {
      throw new Error("npx not found. Please install/reinstall node");
    }
    try {
      this.run(this.npm + " --version");
    } catch {
      throw new Error("npm not found. Please install/reinstall node");
    }
    try {
      this.run(this.node + " --version");
    } catch {
      throw new Error("nodejs not found. Please install/reinstall node");
    }
  }

  install_grapesjs(project_dir) {
    cur_dir = project_dir;
    present = false;
    fs.readdir(cur_dir, function (err, files) {
      if (err) {
        console.log(err);
      } else {
        for (f in files) {
          if (f == "gui") {
            present = true;
            break;
          }
        }
      }
      gui_dir = path.join(cur_dir, "gui");
      if (present == false) {
        fs.mkdir(path.join(__dirname, "test"), (err) => {
          if (err) {
            return console.error(err);
          }
        });
        grapesjs_path = "https://github.com/reactonite/grapesjs/";
        this.run("git init", gui_dir);
        this.run("git remote add origin", gui_dir);
        this.run("git remote add origin " + grapesjs_path, gui_dir);
        this.run(this.npm + " -i", gui_dir);
      }
    });
  }

  start_grapesjs(project_dir) {
    cur_dir = project_dir;
    gui_dir = path.join(cur_dir, "gui");
    this.run(this.npm + " start", gui_dir);
  }

  create_react_app(project_name, rename_to, working_dir = ".") {
    /*Creates a new react app and renames it as specified.

        Parameters
        ----------
        project_name : str
            Project name to be used to create the app
        rename_to : str
            Renames the created React app to this
        working_dir : str
            Working dir to run commands inside
    */
    this.run(
      this.npx +
        " create-react-app " +
        project_name +
        " --use-npm --template cra-template-pwa",
      working_dir
    );
  }

  create_react_app(project_name, rename_to, working_dir = ".") {
    /*Creates a new react app and renames it as specified.

        Parameters
        ----------
        project_name : str
            Project name to be used to create the app
        rename_to : str
            Renames the created React app to this
        working_dir : str
            Working dir to run commands inside
    */
    this.run(
      this.npx +
        " create-react-app " +
        project_name +
        " --use-npm --template cra-template-pwa",
      working_dir
    );
    src = path.join(working_dir, project_name);
    dest = path.join(".", rename_to);
    setTimeout(function () {
      fs.rename(src, dest, (error) => {
        if (error) {
          console.log("There is an error", error);
        }
      });
    }, 1000);
  }

  install(package_name, working_dir) {
    /*Installs the given package in npm and saves in package.json

        Parameters
        ----------
        package_name : str
            Package to be installed.
        working_dir : str
            Directory containing npm project root
    */
    this.run(this.npm + " i " + package_name + " --save", working_dir);
  }

  start(working_dir) {
    /*Runs the command npm start in the given working directory
  Parameters
  ----------
  working_dir : str
      Directory to execute the command in.
  */
    this.run(this.npm + " start", working_dir);
  }
}

a = new NodeWrapper();
