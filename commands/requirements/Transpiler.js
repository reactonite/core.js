const path = require("path");
const fs = require("fs");
const NodeWrapper = require("./NodeWrapper");

class AttributesParser {
  /*Extends HTMLParser to extract tags with attributes from a given HTML string

    Call feed method of HTMLParser to generate data and then retriece it from
    the object of the class. Here's an usage example:

    attributes_parser = AttributesParser()
    attributes_parser.feed("YOUR_HTML_STRING")
    tag_with_attributes = attributes_parser.data
    print(tag_with_attributes)

    Attributes
    ----------
    data : list
        Stores the tags with their attributes
    */

  handle_starttag(tag, attrs) {
    /*Overrides the original handler for start tag and appends the tags to data.
        Parameters
        ----------
        tag : str
            Name of tag being parsed
        attrs : list
            List of attrs corresponding to the current tag
    */
    attrDict = {};
    for (attr in attrs) {
      attrDict[attr[0]] = attr[1];
    }
    try {
      this.data.push({ tag: attrDict });
    } catch {
      this.data = [
        {
          tag: attrDict,
        },
      ];
    }
  }
}

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
        Saves whether Link tag needs to be imported for current page.
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
      a=this.__A_TAG_HANDLER,
      img=this.__IMAGE_TAG_HANDLER,
      script=this.__SCRIPT_TAG_HANDLER,
      style=this.__STYLE_TAG_HANDLER,
      link=this.__LINK_TAG_HANDLER,
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

  __getLinkInfo(link, filepath_from_src, no_var = false) {
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
      pathToLink = path.join(this.src_dir, filepath_from_src, link);
      pathToIndexLink = path.join(pathToLink, "index.html");
      stats_pathToLink = fs.statSync(pathToLink);
      stats_pathToIndexLink = fs.statSync(pathToIndexLink);
      if (stats_pathToLink || stats_pathToIndexLink) {
        var_ = this.__getSafeName(link);
        if (no_var) {
          this.add_to_import.push("import " + link);
          return undefined;
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

  __getAttrsWithLink(attrs, linkAttr, filepath_from_src, no_var = false) {
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
    for (const [key, value] of Object.entries(attrs)) {
      if (key == linkAttr) {
        link_info = this.__getLinkInfo(value, filepath_from_src, no_var);
        if (link_info == undefined) {
          return;
        }
        final_attrs[linkAttr] = link_info;
      } else {
        final_attrs[key] =value;
      }
    }
    return final_attrs;
  }

  __getAttrsForRouterLink(attrs, filepath_from_src) {
    /*Generates attrs for A tag having links to other files.

    If link is internal that is checked and also link is generated, 
    for external link it is returned.

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
    for (const [key, value] of Object.entries(attrs)) {
      if (key == "href") {
        href_info = value;
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
        final_attrs[key] = value;
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
        final_attrs = this.__getAttrsWithLink(attrs, "src", filepath_from_src);
      } else {
        return undefined;
      }
    } else if (tag_handler == this.__STYLE_TAG_HANDLER) {
      return undefined;
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
    for (const [key, value] of Object.entries(attrs)) {
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
      final_attrs[useKey] = value;
    }
    return final_attrs;
  }

  getReactMap(tags, filepath_from_src) {
    /*  Wrapper to generate React Map object comprising of all data needed
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
      }
      var tag_name_attributes = {};
      tag_name_attributes[tag_name] = attrs;
      final_map["tags"].push(tag_name_attributes);
    }
    final_map["imports"] = this.add_to_import.join("\n");
    final_map["variables"] = this.add_variables;
    return final_map;
  }
}

class Transpiler {
  /*Transpiler responsible for translating HTML code to React

    Attributes
    ----------
    project_name : str
        Name of the project as stored in config
    src_dir : str
        Path of the source directory within the project directory
    dest_dir : str
        Path to the transpiled React app within the project directory
    index_routes : dict
        Stores Routes data corresponding to different pages for index.js
    parser : str, optional
        Specify which parser to use for reading HTML files, defaults
        to "html.parser"
    verbose : bool, optional
        Specify the verbosity of the transpiler, defaults to False
    */

  constructor(
    config_settings,
    props_map,
    verbose = false,
    create_project = false
  ) {
    /*Transpiler initiator takes config settings and unpacks variables.

        Parameters
        ----------
        config_settings : dict
            project_name, src_dir, dest_dir as dict object stored
            in config.json
        props_map : dict
            Mapping of props for HTML to React used during transpilation
        verbose : bool, optional
            Specify the verbosity of the transpiler, deafults to False
        create_project : bool, optional
            Set to True if create project is calling method, deafults to False

        Raises
        ------
        RuntimeError
            Raised if the config_settings point to non existing dirs.
    */

    this.project_name = config_settings["project_name"];
    this.src_dir = config_settings["src_dir"];
    this.dest_dir = config_settings["dest_dir"];
    this.props_map = props_map;
    this.index_routes = {};
    this.parser = "node.html.parser";
    this.verbose = verbose;

    if (create_project) {
      this.src_dir = path.join(".", this.project_name, this.src_dir);
      this.dest_dir = path.join(".", this.project_name, this.dest_dir);
    }

    const npm = new NodeWrapper();

    if (!fs.existsSync(path.join(".", this.src_dir))) {
      throw Error("Source directory doesn't exist at  " + String(this.src_dir));
    }

    if (!fs.existsSync(path.join(".", this.dest_dir))) {
      if (create_project) {
        const project_dir = path.join(".", this.project_name);
        npm.create_react_app(
          (project_name = this.project_name),
          (working_dir = project_dir),
          (rename_to = this.dest_dir)
        );
      } else {
        npm.create_react_app(
          (project_name = this.project_name),
          (rename_to = this.dest_dir)
        );
      }
      // Install NPM packages
      npm.install(
        (package_name = "react-helmet"),
        (working_dir = this.dest_dir)
      );
      npm.install(
        (package_name = "react-router-dom"),
        (working_dir = this.dest_dir)
      );
    }
  }

  __replaceAttrs($, tag_name, or_attrs, f_attrs) {
    /*Replaces the attrs for updated tags comparing original and final attrs.

        Parameters
        ----------
        $ : Cheerio
            passed by reference.
        tag_name : str
            Name of tag being worked upon.
        or_attrs : dict
            Dictonary consisting of original attributes of HTML.
        f_attrs : dict
            Dictonary consisting of final attributes for React.
   */
    if (or_attrs == f_attrs) {
      return;
    }
    
    const selector = $(this.__getTagWithAttribute(tag_name,or_attrs));
    var htmlTag = selector.first().attr();
    upperAttrs = {};
    lowerAttrs = {};

    if (htmlTag == undefined) {
      for (const [attr] of Object.entries(or_attrs)) {
        upperAttrs[attr] = or_attrs[attr].toUpperCase();
        lowerAttrs[attr] = or_attrs[attr].toLowerCase();
      }
      htmlTag = $(this.__getTagWithAttribute(tag_name,upperAttrs)).first().attr();
      if (htmlTag == undefined) {
        htmlTag = $(this.__getTagWithAttribute(tag_name,lowerAttrs)).first().attr();
      }
    }
    if (htmlTag != undefined) {
      $(htmlTag.first().attr(f_attrs));
      if (tag_name == "a" && "to" in f_attrs){
          $(htmlTag.first().get(0).tagName = "Link")
      }
    }
  }

  __getTagWithAttribute(tag_name,attrs){
    var tag_with_attr = tag_name
    for (const [key, value] of Object.entries(attrs)){
      tag_with_attr=tag_with_attr+'[' +key+'="'+value+'"]'
    }
    return tag_with_attr
  }

  __deleteTag($, tag_name, attrs){
    /*Deletes the tag corresponding to given tag_name and attrs.
    Parameters
    ----------
     $ : Cheerio
        passed by reference.
    tag_name : str
        Name of tag being worked upon.
    attrs : dict
        Dictonary consisting of original attributes of HTML.
    */
    const selector = $(this.__getTagWithAttribute(tag_name,attrs));
    var htmlTag = selector.first().attr();
    upperAttrs = {}
    lowerAttrs = {}
    if (htmlTag == undefined) {
      for (const [attr] of Object.entries(attrs)) {
      upperAttrs[attr] = attrs[attr].toUpperCase();
      lowerAttrs[attr] = attrs[attr].toLowerCase();
    }
    htmlTag = $(this.__getTagWithAttribute(tag_name,upperAttrs)).first().attr();
    if (htmlTag == undefined) {
      htmlTag = $(this.__getTagWithAttribute(tag_name,lowerAttrs)).first().attr();
    }
    }
    if (htmlTag != undefined) {
      htmlTag.remove();
    }
  }

   __generateReactFileContent($, function_name, filepath_from_src){
    /*Generates React code from HTML soup object.

        Parameters
        ----------
        $ : Cheerio
            passed by reference.
        function_name : str
            Function name to be used from filename without extension with
            first letter capitalized
        filepath_from_src : str
            Path to file from src directory

        Returns
        -------
        str
            Content for React file.
    */
    styleTags = [];
    $("style").each((i, el) => {styleTags.push($(el).toString());});
    scriptTags = [];
    $("script").each((i, el) => {
      var s = $(el).toString();
      if (!s.includes("src")) {scriptTags.push(s);}
    });

    //Attribute parser code

    var reactCodeMapper = new ReactCodeMapper(this.src_dir, this.dest_dir, this.props_map)
    var react_map = reactCodeMapper.getReactMap(tag_with_attributes, filepath_from_src)
    var final_tags = react_map['tags']
    var react_variables = react_map['variables']
    


    
  }

  __getReactComponentName(link) {
    /*Generates safe name for React compnents from path to file.

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
    return "REACTONITE" + varName.toUpperCase();
  }

  __rebuildIndexJs() {
    /*Generates the index.js for React apps entry point, needed to handle
        links to pages

        Raises
        ------
        RuntimeError
            Raised if the index.js file is not found in dest_dir
    */
    pathToIndexJs = path.join(this.dest_dir, "src", "index.js");
    if (!fs.statSync(pathToIndexJs)) {
      throw new Error(
        "Looks like you are missing index.js file in \
                React directory! It seems to be an NPM/React issue rather."
      );
    }
    fs.open(path, "w", function (err, fd) {
      if (err) {
        throw "Error opening the file" + err;
      }
      file_content = this.__generateIndexJsContent();
      fs.write(fd, file_content, 0, file_content.length, null, function (err) {
        if (err) {
          throw "Error writing file: " + err;
        }
      });
    });
    NodeWrapper().prettify((path = pathToIndexJs));
  }

  __addRoutesToIndexLinkArray(filePathFromSrc, filenameNoExt) {
    /*Adds links to this.index_routes to be used in index.js generation

        Parameters
        ----------
        filePathFromSrc : str
            Path to the folder where file is in dest_dir folder from src
        filenameNoExt : str
            Filename with no extension
    */

    if (filenameNoExt == "index") {
      htmlPath = path.normalize(filePathFromSrc);
      jsPath = htmlPath.split(path.sep).join("./");
      this.index_routes[jsPath] = "./" + jsPath + "/index";
    } else {
      htmlPath = path.normalize(path.join(filePathFromSrc, filenameNoExt));
      jsPath = htmlPath.split(path.sep).join("./");
      this.index_routes[jsPath] = "./" + jsPath;
    }
  }

   __generateIndexJsContent(){
    /*Generates content for index.js file in React codebase with handled routes

        Returns
        -------
        str
            Content for index.js file in React codebase
    */
   var router = 'import {\n BrowserRouter as Router,\n Switch, \nRoute \n} from "react-router-dom";'
   var imports = []
   var routes = []

  for (const [key, value] of Object.entries(this.index_routes)){
     var componentName = this.__getReactComponentName(value)
     var importReact = 'import ' + componentName + ' from "' + value + '";'
     imports.push(importReact)
     var routeReact = '<Route path="/'+key+'">\n<'+componentName+'/>\n</Route>'
     routes.push(routeReact)
  }

  imports = imports.join('/')
  routes = routes.join('/')

  return 'import React from "react";\n\
        import ReactDOM from "react-dom";\n\
        import * as serviceWorkerRegistration from ./serviceWorkerRegistration";\n\
        import reportWebVitals from "./reportWebVitals";\n'+
        router +
        'import App from "./App";\n'+
        imports+

        'ReactDOM.render(\n\
        <Router>\n\
            <Switch>\n'+
            routes+
            '<Route path="/">\n\
                <App />\n\
            </Route>\n\
            </Switch>\n\
        </Router>,\n\
        document.getElementById("root")\n\
        );\n'+
        '// If you dont want your app to work offline, you can change\n\
        // register() to unregister() below. Note this comes with some\n\
        // pitfalls. Learn more about service workers: https://cra.link/PWA\n\
        serviceWorkerRegistration.register();\n\
        // If you want to start measuring performance in your app, pass a\n\
        // function to log results (for example: reportWebVitals(console.log))\n\
        // or send to analytics endpoint. Learn more: https://bit.ly/CRA-vitals\n\
        reportWebVitals();\n'
  }


 
}
