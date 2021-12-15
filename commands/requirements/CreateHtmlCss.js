var fs = require("fs");
var path = require("path");
/**
 *Takes body of the POST response from GrapesJS and saves HTML File

 * @param {string} content HTML Content
 * @param {string} loc Location where we have to save the HTML File
 */
function saveHtml(content, loc) {
  var html_front =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>The HTML5 Herald</title><meta name="description" content="The HTML5 Herald"/><meta name="author" content="SitePoint"/><link rel="stylesheet" href="./main.css"/></head><body>';
  var html_back = "</body></html>";
  var html_content = html_front + content + html_back;
  fs.writeFileSync(path.join(loc, "index.html"), html_content, { flag: "w+" });
}

/**
 *Takes body of the POST response from GrapesJS and saves CSS File
 * @param {string} content CSS Content
 * @param {location} loc Location where we have to save the CSS File
 */
function saveCss(content, loc) {
  fs.writeFileSync(path.join(loc, "main.css"), content, { flag: "w+" });
}
module.exports = {
  saveHtml,
  saveCss,
};
