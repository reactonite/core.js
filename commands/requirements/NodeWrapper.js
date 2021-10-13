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
}

a = new NodeWrapper();
