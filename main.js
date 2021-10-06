#! /usr/bin/env node
const { program } = require("commander");
const create_project = require("./commands/create-project");
const transpile_project = require("./commands/transpile_project");
const build_project = require("./commands/build");

program
  .command("create-project <project>")
  .description(
    "Command for creating new Reactonite project from scratch, Creates a new reactonite project with given PROJECT_NAME and installs npm."
  )
  .action(create_project);

program
  .command("transpile-project")
  .description(
    "Command for transpiling a Reactonite project built using create-project commandline."
  )
  .option(
    "-v, --verbose",
    "Specifies the verbosity of the command. If not specified, it will be marked as false."
  )
  .action(transpile_project);

program
  .command("build")
  .description("Command to get a static build of your app after transpilation.")
  .action(build_project);

program.parse();
