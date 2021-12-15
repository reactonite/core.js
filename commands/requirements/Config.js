const fs = require("fs");
var { create_file, write_to_json_file } = require("./Helpers");

class Config {
  /**
   * A Class to manage and maintain project configuration. One can add/remove/modify config variables and save/load it easily
   *@property {string} config_path Path to configuration file from where to load/save
   *@property {object} config Config settings dictionary
   *@param {string} config_path Path to configuration file from where to load/save
   *@param {boolean} load Whether to load config on object creation, default is false
   */

  constructor(config_path, load = false) {
    this.config_path = config_path;
    this.config = {};

    if (load) {
      this.load_config();
    }
  }
  /**
   * Adds/updates a variable to the config
   */
  add_to_config(config_name, config_value) {
    this.config[config_name] = config_value;
  }

  /**
   * Returns the configuration as a dictionary
   */
  get_config() {
    return this.config;
  }

  /**
   * Gets a config variable
   */
  get(key) {
    return this.config[key];
  }

  /** 
   * Saves the configuration to the config_path
    in JSoN format. It first creates the file if it
    doesn't exist, then writes into it.
  */
  save_config() {
    if (!fs.existsSync(this.config_path)) {
      create_file(this.config_path);
    }
    write_to_json_file(this.config_path, JSON.stringify(this.config));
  }

  /**
   * Loads the configuration from the config_path.
   * @throws {FileNotFoundError} Error raised if config file not found at the config_path 
        if not os.path.exists(self.config_path):
        raise FileNotFoundError(
            "Reactonite config.json file doesn't exist, can't proceed."
        )
  */
  load_config() {
    if (!fs.existsSync(this.config_path)) {
      throw new Error(
        "Reactonite config.json file doesn't exist, can't proceed."
      );
    }
    this.config = JSON.parse(fs.readFileSync(this.config_path, "utf8"));
  }

  /**
   * Pretty prints the config variables.
   */
  toString() {
    return_str = "";
    for (const [key, value] of Object.entries(this.config)) {
      return_str += "{" + key + "}: {" + value + "}\n";
    }
    return return_str;
  }
}

module.exports = Config;
