var fs = require('fs-extra');
var glob = require('glob');
var _ = require('lodash');
var beautify = require('js-beautify').js_beautify;
var beautifyrc = fs.readJsonSync('.jsbeautifyrc');
var args = require('yargs').argv;

beautifyJsFiles();

function beautifyJsFiles() {
  glob('./app/**/*.js', {}, function (err, files) {
    if (err) {
      throw new Error('Error finding js files: ' + err);
    }
    _.forEach(files, beautifyJsFile);
  });
}

function beautifyJsFile(file) {
  var data = fs.readFileSync(file, 'utf8');
  var beautifyData = beautify(data, beautifyrc);
  if (!_.eq(data, beautifyData)) {
    var msg = 'File is not beautified: ' + file;
    if (args.verify) {
      throw new Error(msg);
    } else if (args.beautify) {
      console.log('Beautify file: ' + file);
      fs.writeFileSync(file, beautifyData);
    } else {
      console.log(msg);
    }
  }
}
