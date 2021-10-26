const fs = require("fs");
var { create_file, write_to_json_file } = require("./Helpers");

class Config {
  /*
    A Class to manage and maintain project configuration.
    One can add/remove/modify config variables and save/load
    it easily

    Attributes
    ----------
    config_path : str
        Path to configuration file from where to load/save
    config : dict
        Config settings dictionary

    Parameters
    ----------
    config_path : str
        Path to configuration file from where to load/save
    load : bool
        Whether to load config on object creation, default is False
  */

  constructor(config_path, load = false) {
    this.config_path = config_path;
    this.config = {};

    if (load) {
      this.load_config();
    }
  }

  add_to_config(config_name, config_value) {
    // Adds/updates a variable to the config
    this.config[config_name] = config_value;
  }

  get_config() {
    //Returns the configuration as a dictionary
    return this.config;
  }

  get(key) {
    //Gets a config variable
    return this.config[key];
  }

  save_config() {
    /*
    Saves the configuration to the config_path
    in JSoN format. It first creates the file if it
    doesn't exist, then writes into it.
    */

    if (!fs.existsSync(this.config_path)) {
      create_file(this.config_path);
    }
    write_to_json_file(this.config_path, JSON.stringify(this.config));
  }

  load_config() {
    /*
    Loads the configuration from the config_path.

    Raises
    ------
    FileNotFoundError
        Raised if config file not found at the config_path 
    */

    if (!fs.existsSync(this.config_path)) {
      throw new Error(
        "Reactonite config.json file doesn't exist, can't proceed."
      );
    }
    this.config = JSON.parse(fs.readFileSync(this.config_path, "utf8"));
  }

  toString() {
    //Pretty prints the config variables.
    return_str = "";
    for (const [key, value] of Object.entries(this.config)) {
      return_str += "{" + key + "}: {" + value + "}\n";
    }
    return return_str;
  }
}

module.exports = Config;
