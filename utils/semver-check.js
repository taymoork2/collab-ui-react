var nodeVersion = getParsedVersion(process.version);
var isNodeValid = nodeVersion >= 4;
if (!isNodeValid) {
  console.log('NodeJS version should be at least version 4, current is:', process.version);
  console.log('Consider using nvm: https://github.com/creationix/nvm');
  process.exit(1);
}

var child = require('child_process').exec('npm --version');
if (child.stdout) {
  child.stdout.on('data', function(childData) {
    var npmVersion = getParsedVersion(childData);
    var isNpmValid = (npmVersion >= 2) && (npmVersion < 3);
    if (!isNpmValid) {
      console.log('npm version should strictly be version 2, current is:', npmVersion);
      console.log('`npm install -g npm@latest-2` may do the trick');
      process.exit(1);
    }
  });
}

function getParsedVersion(version) {
  return parseFloat((version || '').replace(/v/, ''));
}
