#! /usr/bin/env node
const { program } = require("commander");
const create_project = require("./commands/create-project");
program
  .command("create-project <project>")
  .description(
    "Command for creating new Reactonite project from scratch, Creates a new reactonite project with given PROJECT_NAME and installs npm."
  )
  .action(create_project);

program.parse();
