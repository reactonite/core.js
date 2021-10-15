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

  __customTagAttrsHandler(attrs, tag_handler, filepath_from_src, link) {
    /*Custom tag and attributes handler for parsing attrs from CUSTOM_TAG_HANDLERS

        Parameters
        ----------
        attrs : dict
            Attributes for corresponding tag needed to be handled
        tag_handler : str
            Tag handler type to be used in mapping
        filepath_from_src : str
            Path to file from src directory

        Returns
        -------
        dict
            Final attributes for that tag, if None is returned delete the tag
      */
    final_attrs = {};
    if (tag_handler == this.__A_TAG_HANDLER) {
      res = this.__getAttrsForRouterLink(attrs, filepath_from_src);
      final_attrs = res[0];
      is_internal_link = res[1];
      if (!this.router_link_imported && is_internal_link) {
        this.add_to_import.push("import " + link + ' from "react-router-dom";');
        this.router_link_imported = true;
      }
    } else if (tag_handler == this.IMAGE_TAG_HANDLER) {
      final_attrs = this.__getAttrsWithLink(attrs, "src", filepath_from_src);
    } else if (tag_handler == this.__SCRIPT_TAG_HANDLER) {
      if ("src" in attrs) {
        final_attrs = self.__getAttrsWithLink(attrs, "src", filepath_from_src);
      } else {
        return;
      }
    } else if (tag_handler == this.__STYLE_TAG_HANDLER) {
      return;
    } else if (tag_handler == this.__LINK_TAG_HANDLER) {
      if (attrs["rel"] == "stylesheet") {
        final_attrs = this.__getAttrsWithLink(
          attrs,
          "href",
          filepath_from_src,
          (no_var = true)
        );
      }
      return None;
    }
    return final_attrs;
  }

  __getReactAttrs(attrs) {
    /*Generates renamed attributes correspoding to React, and removes
        inline style tags and tags starting with on like onclick etc.

        Parameters
        ----------
        attrs : dict
            Attributes in HTML format

        Returns
        -------
        dict
            Attributes in React format
    */
    final_attrs = {};
    for (const [key, value] of Object.entries(final_attrs)) {
      if (key == "style") {
        continue;
      }
      if (key.startsWith("on")) {
        continue;
      }
      if (key in this.props_map) {
        useKey = this.props_map[attrKey];
      } else {
        useKey = key;
      }
      final_attrs[useKey] = attrs[key];
    }
    return final_attrs;
  }

  getReactMap(tags, filepath_from_src) {
    /*Wrapper to generate React Map object comprising of all data needed
        to convert HTML to React

        Parameters
        ----------
        tags : dict
            HTML attributes extracted using AttributesParser
        filepath_from_src : str
            Path to file from src directory

        Returns
        -------
        dict
            Final mapping of tags with imports and varibles for React, if any
            attribute is None then tag needs to be deleted
    */
    final_map = {
      imports: [],
      tags: [],
      variables: [],
    };
    for (const [tag_name] of Object.entries(tags)) {
      attrs = this.__getReactAttrs(tags[tag_name]);
      if (tag_name in this.CUSTOM_TAG_HANDLERS) {
        attrs = this.__customTagAttrsHandler(
          attrs,
          this.CUSTOM_TAG_HANDLERS[tag_name],
          filepath_from_src
        );
        final_map["tags"].push({ tag_name: attrs });
      }
    }
    final_map["imports"] = this.add_to_import.join("\n");
    final_map["variables"] = this.add_variables;
    return final_map;
  }
}
