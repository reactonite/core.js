const paths = require("path");
const fs = require("fs");

/**
 *Returns location of the parent directory for a given path.
 * @param {string} path Path of the file or folder for which we need the parent directory.
 * @returns {string} Location of the parent directory for a given path
 */
function get_parent_dir(path) {
  var pdir = paths.dirname(path);
  if (!pdir) {
    pdir = ".";
  }
  return pdir;
}

/**
 * Creates directory at the given path if it doesn't exist.
 * @param {string} path Path to directory which needs to be created.
 * @throws {RuntimeError} Error Raised if directory can't be created.
 */
function create_dir(path) {
  const path_exists = fs.existsSync(path);
  if (path_exists && fs.statSync(path).isDirectory()) {
    console.log(path + " already exists. Skipping.");
    return;
  }
  try {
    fs.mkdirSync(path, { recursive: true });
  } catch {
    throw "Folder can not be created at " + path;
  }
}

/**
 * Creates the file at the given path if it doesn't exist.
 * @param {string} path Path to file which needs to be created.
 * @throws {RuntimeError} Error Raised if file can't be created.
 */
function create_file(path) {
  const pdir = get_parent_dir(path);
  try {
    fs.accessSync(pdir, fs.constants.W_OK);
    try {
      fs.closeSync(fs.openSync(path, "w"));
    } catch {
      throw "File can not be created at " + path;
    }
  } catch {
    throw "Not enough permissions to create file at " + pdir;
  }
}

/**
 *Writes content to a json file at the given path. Raises
  exception if file not exists.
 * @param {string} path Path to file where content will be dumped.
 * @param {object} content Object to be dumped into the file.
 * @throws {FileNotFoundError}  Raised if file doesn't exist.
 * @throws {RuntimeError} Raised if not enough permissions to write in file
 */

function write_to_json_file(path, content) {
  try {
    fs.accessSync(path, fs.constants.W_OK);
    try {
      fs.writeSync(fs.openSync(path, "w"), content);
    } catch {
      throw "File can not be reached at " + path;
    }
  } catch (e) {
    throw "Not enough permissions to write at " + path;
  }
}

module.exports = {
  create_file,
  write_to_json_file,
  create_dir,
};
