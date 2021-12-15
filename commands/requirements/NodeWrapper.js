const os = require("os");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { cwd } = require("process");

class NodeWrapper {
   /**
   * Node wrapper to execute commands corresponding to node js using python.
   * @property {string} npx Commandline to be used for npx according to system(Linux, Windows)
   * @property {string} npm Commandline to be used for npm according to system(Linux, Windows)
   * @property {string} node Commandline to be used for node according to system(Linux, Windows)
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

  run(cmd, path = ".") {
    try {
      execSync(cmd, { cwd: path });
    } catch (e) {
      throw e;
    }
  }

   /**
   * Checks the installation of Nodejs/npm/npx. If npm is not available it throws an error.
   * @throws {RuntimeError} Error raised if Nodejs/npm/npx is not available.
   */
  check_react_install() {
    try {
      this.run(this.npx + " --version");
    } catch {
      throw "npx not found. Please install/reinstall node";
    }
    try {
      this.run(this.npm + " --version");
    } catch {
      throw "npm not found. Please install/reinstall node";
    }
    try {
      this.run(this.node + " --version");
    } catch {
      throw "nodejs not found. Please install/reinstall node";
    }
  }

  install_grapesjs(project_dir) {
    const cur_dir = project_dir;
    present = false;
    try {
      const files = fs.readdirSync(cur_dir, {recursive=true});
      files.forEach((file) => {
        if (file=="gui"){
          present=true;
          break;
        }
      });
      const gui_dir = path.join(cur_dir, "gui");
      if (present == false) {
        try {
          fs.mkdirSync(path.join(__dirname, "test"));
          grapesjs_path = "https://github.com/reactonite/grapesjs/";
          this.run("git init", gui_dir);
          this.run("git remote add origin", gui_dir);
          this.run("git remote add origin " + grapesjs_path, gui_dir);
          this.run(this.npm + " -i", gui_dir);
        } catch {
          throw e;
        }
      }
    } catch (e) {
      throw e;
    }
  }

  start_grapesjs(project_dir) {
    const cur_dir = project_dir;
    const gui_dir = path.join(cur_dir, "gui");
    this.run(this.npm + " start", gui_dir);
  }

  /**
   * Creates a new react app and renames it as specified.
   * @param {string} project_name Project name to be used to create the app
   * @param {string} rename_to Renames the created React app to this
   * @param {string} working_dir Working dir to run commands inside
   */
  create_react_app(project_name, rename_to, working_dir = ".") {
    this.run(
      this.npx +
        " create-react-app " +
        project_name +
        " --use-npm --template cra-template-pwa",
      working_dir
    );
    const src = path.join(working_dir, project_name);
    const destn = path.join(".", rename_to);
    try {
      fs.renameSync(src, destn);
    } catch (e) {
      throw e;
    }
  }

  /**
   *Installs the given package in npm and saves in package.json
   * @param {string} package_name Package to be installed.
   * @param {string} working_dir Directory containing npm project root
   */
  install(package_name, working_dir) {
    this.run(this.npm + " i " + package_name + " --save", working_dir);
  }

   /**
   *Create an optimized build of your app in the build folder
   * @param {string} working_dir Directory containing npm project root
   */
  build(working_dir) {
    this.run(this.npm + " run build", working_dir);
  }

   /**
   * Runs code formatting using prettier on the given path
   * @param {string} path Filepath or directory to run prettier on
   * @param {string} working_dir Directory from which command is run
   */
  prettify(path, working_dir = ".") {
    this.run(this.npx + " prettier --write " + path, working_dir);
  }
}
