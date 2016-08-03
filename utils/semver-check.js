var isWindows = /^win/.test(process.platform);

var nodeVersion = getParsedVersion(process.version);
var isNodeValid = nodeVersion >= 4;
if (!isNodeValid) {
  console.log('NodeJS version should be at least version 4, current is:', process.version);
  console.log('Consider using nvm: https://github.com/creationix/nvm');
  process.exit(1);
}

var spawn = require('child_process').spawn;
var cp;
if (isWindows) {
  cp = spawn('cmd', ['/c', 'npm', '--version']);
} else {
  cp = spawn('npm', ['--version']);
}
cp.stdout.on('data', function(data) {
  var npmVersion = getParsedVersion(data.toString());
  var isNpmValid = (npmVersion >= 2) && (npmVersion < 3);
  if (!isNpmValid) {
    console.log('npm version should strictly be version 2, current is:', npmVersion);
    console.log('`npm install -g npm@latest-2` may do the trick');
    process.exit(1);
  }
});

function getParsedVersion(version) {
  return parseFloat((version || '').replace(/v/, ''));
}
