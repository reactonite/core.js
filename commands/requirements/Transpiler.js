class ReactCodeMapper {
  /*Class to convert tags and props from HTML to React

    Call getReactMap method for converting tags fed for HTML and get
    corresponding React Mapping. Here's an usage example:

    reactCodeMapper = ReactCodeMapper(source_dir, destination_dir, props_map)
    react_map = reactCodeMapper.getReactMap(tag_with_attributes)
    print(react_map)

    Attributes
    ----------
    CUSTOM_TAG_HANDLERS : dict
        Stores mapping correspoding to tags which are handled seperately.
    src_dir : str
        Source directory for the HTML codebase.
    dest_dir : str
        Destination directory for the React codebase.
    props_map : dict
        Mapping of attrs for HTML to React from props_map.py
    add_to_import : list
        Stores imports corresponding to variables created during transpilation.
    add_variables : list
        Stores newly created variables during transpilation.
    router_link_imported : bool, optional
        Saves wether Link tag needs to be imported for current page.
    */
  constructor(src_dir, dest_dir, props_map) {
    this.src_dir = src_dir;
    this.dest_dir = dest_dir;
    this.props_map = props_map;
    this.add_to_import = [];
    this.add_variables = [];
    this.router_link_imported = false;

    this.__A_TAG_HANDLER = "A_TAG_HANDLER";
    this.__IMAGE_TAG_HANDLER = "IMAGE_TAG_HANDLER";
    this.__SCRIPT_TAG_HANDLER = "SCRIPT_TAG_HANDLER";
    this.__STYLE_TAG_HANDLER = "STYLE_TAG_HANDLER";
    this.__LINK_TAG_HANDLER = "LINK_TAG_HANDLER";

    this.CUSTOM_TAG_HANDLERS = {
      a: self.__A_TAG_HANDLER,
      img: self.__IMAGE_TAG_HANDLER,
      script: self.__SCRIPT_TAG_HANDLER,
      style: self.__STYLE_TAG_HANDLER,
      link: self.__LINK_TAG_HANDLER,
    };
  }

  __getSafeName(link) {
    /*Generates safe name for varibale from path to file.

        Parameters
        ----------
        link : str
            Path to file for which varibale is created.

        Returns
        -------
        str
            Variable name generated from link
  */
    varName = "";
    var regex = /^[0-9a-z]+$/;
    for (ch in link) {
      _ch = link.charAt(ch);
      if (!_ch.match(regex)) {
        _ch = "_";
      }
      varName += _ch;
    }
    return varName;
  }

  __getLinkInfo(self, link, filepath_from_src, no_var = false) {
    /*Generates link information.

        If link is internal corresponding variable name is generated, for
        external link it is returned.

        Parameters
        ----------
        link : str
            Link for filepath or external link.
        filepath_from_src : str
            Path to file from src.
        no_var : bool, optional
            To generate import variable or just import file, default is False
            i.e. generate variable

        Returns
        -------
        str
            Variable name generated from link or link in external case.
  */

    if (link) {
      pathToLink = path.join(self.src_dir, filepath_from_src, link);
      pathToIndexLink = path.join(pathToLink, "index.html");
      stats_pathToLink = fs.statSync(pathToLink);
      stats_pathToIndexLink = fs.statSync(pathToIndexLink);
      if (stats_pathToLink || stats_pathToIndexLink) {
        var_ = this.__getSafeName(link);
        if (no_var) {
          this.add_to_import.push("import " + link);
          return "@";
        } else {
          this.add_to_import.push("import " + var_ + " from " + link);
        }
        this.add_variables.push(var_);
        return "{" + var_ + "}";
      }
    } else {
      return link;
    }
  }

  __getAttrsWithLink(attrs, linkAttr, filepath_from_src, no_var = False) {
    /*
    Generates attrs for tags having links to other files.

    If link is internal corresponding variable name is generated, for
    external link it is returned.

    Parameters
    ----------
    attrs : dict
        Attributes of tag to be worked upon.
    linkAttr : str
        Name of attr that correspond to link of file, example 'src' in
        case of script tag
    filepath_from_src : str
        Path to file from src directory.
    no_var : bool, optional
        To generate import variable or just import file, default is False
        i.e. generate variable

    Returns
    -------
    dict
        Final dictonary of attributes with link handled     
 */
    final_attrs = {};
    for (const [key, value] of Object.entries(final_attrs)) {
      if (key == linkAttr) {
        link_info = this.__getLinkInfo(value, filepath_from_src, no_var);
        if (link_info == "@") {
          return;
        }
        final_attrs[linkAttr] = link_info;
      } else {
        final_attrs[key] = attrs[key];
      }
    }
    return final_attrs;
  }

  __getAttrsForRouterLink(attrs, filepath_from_src) {
    /*Generates attrs for A tag having links to other files.

    If link is internal that is checked and also link is generated is
    generated, for external link it is returned.

    Parameters
    ----------
    attrs : dict
        Attributes of tag to be worked upon.
    filepath_from_src : str
        Path to file from src directory.

    Returns
    -------
    tuple
        Tuple of final dictonary of attributes with link handled and
        information about internal link
    */

    final_attrs = {};
    is_internal = false;
    for (const [key, value] of Object.entries(final_attrs)) {
      if (key == "href") {
        href_info = attrs[key];
        pathRef = path.join(this.src_dir, filepath_from_src, href_info);
        pathRefIndex = path.join(
          this.src_dir,
          filepath_from_src,
          href_info,
          "index.html"
        );
        stats_pathToLink = fs.statSync(pathToLink);
        stats_pathToIndexLink = fs.statSync(pathToIndexLink);
        if (stats_pathToLink || stats_pathToIndexLink) {
          htmlPath = path.normalize(path.join(filepath_from_src, href_info));
          jsPath = htmlPath.split(path.sep).join("/");
          jsPath = jsPath.replace(".html", "");
          if (jsPath == "index") {
            jsPath = "/";
          }
          is_internal = true;
          final_attrs["to"] = jsPath;
        } else {
          final_attrs["href"] = href_info;
        }
      } else {
        final_attrs[key] = attrs[key];
      }
    }
    return [final_attrs, is_internal];
  }
}
