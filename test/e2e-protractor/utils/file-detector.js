// TODO: temporary copy from selenium-webdriver/remote to figure out what is happening with our file upload
/* eslint-env es6 */
/* eslint-disable */
const AdmZip = require('adm-zip'),
  fs = require('fs');

const cmd = require('selenium-webdriver/lib/command'),
  input = require('selenium-webdriver/lib/input'),
  promise = require('selenium-webdriver/lib/promise');

class FileDetector extends input.FileDetector {
  /**
   * Prepares a `file` for use with the remote browser. If the provided path
   * does not reference a normal file (i.e. it does not exist or is a
   * directory), then the promise returned by this method will be resolved with
   * the original file path. Otherwise, this method will upload the file to the
   * remote server, which will return the file's path on the remote system so
   * it may be referenced in subsequent commands.
   *
   * @override
   */
  handleFile(driver, file) {
    return promise.checkedNodeCall(fs.stat, file).then(function(stats) {
      if (stats.isDirectory()) {
        return file;  // Not a valid file, return original input.
      }

      var zip = new AdmZip();
      zip.addLocalFile(file);
      // Stored compression, see https://en.wikipedia.org/wiki/Zip_(file_format)
      zip.getEntries()[0].header.method = 0;

      var command = new cmd.Command(cmd.Name.UPLOAD_FILE)
          .setParameter('file', zip.toBuffer().toString('base64'));
      console.log('command: ', command);
      return driver.schedule(command,
          'remote.FileDetector.handleFile(' + file + ')');
    }, function(err) {
      console.log('error occurred in file detector: ', err);
      if (err.code === 'ENOENT') {
        return file;  // Not a file; return original input.
      }
      throw err;
    });
  }
}

module.exports = FileDetector;
