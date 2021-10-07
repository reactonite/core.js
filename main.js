#! /usr/bin/env node
const { program } = require("commander");
const create_project = require("./commands/create-project");
const transpile_project = require("./commands/transpile-project");
const build_project = require("./commands/build");
const start_project = require("./commands/start");
const gui = require("./commands/gui");

program
  .command("create-project <project_name>")
  .description(
    "Command for creating new Reactonite project from scratch.\n\nCreates a new reactonite project with given PROJECT_NAME and installs npm.\npackages along with basic directory structure layout.\n\nParameters\n----------\nproject_name : str\n   Name of the project to be created.\n\nRaises\n------\nRuntimeError\n   If project name is invalid."
  )
  .action(create_project);

program
  .command("transpile-project")
  .description(
    "Command for transpiling a Reactonite project built using \ncreate-project commandline.\n\nParameters\n----------\nverbose : bool, optional\n   Verbosity of the command\n\nRaises\n------\nFileNotFoundError\n   If config.json file doesn't exist."
  )
  .option(
    "-v, --verbose",
    "Specifies the verbosity of the command. If not specified, it will be marked as false."
  )
  .action(transpile_project);

program
  .command("build")
  .description(
    "Command to get a static build of your app after transpilation.\n\nRaises\n------\nFileNotFoundError\n    If config.json file doesn't exist."
  )
  .action(build_project);

program
  .command("start")
  .description(
    "Command to start realtime development transpiler for Reactonite. It \nstarts react development server in a seperate thread as well and watches \nfor changes in project directory and transpiles codebase.\n\nRaises\n------\nFileNotFoundError\n    If config.json file doesn't exist\nRuntimeError\n   If ReactJs development thread is not able to start"
  )
  .action(start_project);

program
  .command("gui <project>")
  .description(
    "Command to start realtime development transpiler and GUI for Reactonite. It\nstarts react development server and GUI in a seperate thread as well and\nwatches for changes in project directory and transpiles codebase.\n\nParameters\n----------\nproject_name : str\n     Name of the project to be created.\nRaises\n------\nFileNotFoundError\n     If config.json file doesn't exist\nRuntimeError\n     If ReactJs development thread is not able to start"
  )
  .action(gui);

program.parse();
