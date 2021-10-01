const paths = require("path");
const fs = require("fs");

function get_parent_dir(path) {
  /*Returns location of the parent directory for a given path.

    Parameters
    ----------
    path : str
        Path of the file or folder for which we need the parent directory.

    Returns
    -------
    str
        Location of the parent directory
    */

  pdir = paths.dirname(path);
  if (!pdir) {
    pdir = ".";
  }
  return pdir;
}

function create_dir(path) {
  /*Creates directory at the given path if it doesn't exist.

    Parameters
    ----------
    path : str
        Path to directory which needs to be created.

    Raises
    ------
    RuntimeError
        Raised if directory can't be created.
    */

  const stats = fs.existsSync(path);
  if (stats && fs.statSync(path).isDirectory) {
    console.log(path, "already exists. Skipping.");
    return;
  }
  fs.mkdir(path, { recursive: true }, function (err) {
    if (err) {
      throw new Error("Folder can not be created at ", path);
    }
  });
}

function create_file(path) {
  /*Creates the file at the given path if it doesn't exist.

    Parameters
    ----------
    path : str
        Path to file which needs to be created.

    Raises
    ------
    RuntimeError
        Raised if file can't be created.
    */
  pdir = get_parent_dir(path);
  fs.access(pdir, fs.constants.W_OK, function (err) {
    if (err) {
      console.log("Not enough permissions to create file at ", pdir);
    } else {
      fs.open(path, "w", function (err, fd) {
        if (err) {
          throw new Error("File can not be created at " + str(path));
        } else {
          fs.close(fd, function () {});
        }
      });
    }
  });
}

function write_to_json_file(path, content) {
  /*
    Writes content to a json file at the given path. Raises
    exception if file not exists.

    Parameters
    ----------
    path : str
        Path to file where content will be dumped.
    content : dict
        Dictonary to be dumped into the file.

    Raises
    ------
    FileNotFoundError
        Raised if file doesn't exist.
    RuntimeError
        Raised if not enough permissions to write in file
*/
  fs.access(pdir, fs.constants.W_OK, function (err) {
    if (err) {
      console.log("Not enough permissions to write at ", path);
    } else {
      fs.open(path, "w", function (err, fd) {
        if (err) {
          throw new Error("File can not be reached at ", path);
        } else {
          fs.write(fd, content, 0, content.length, null, function (err) {
            if (err) {
              throw "error writing file: " + err;
            }
            fs.close(fd, function () {});
          });
        }
      });
    }
  });
}

module.exports = {
  create_file,
  write_to_json_file,
  create_dir,
};
