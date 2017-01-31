var isWindows = /^win/.test(process.platform);

var nodeVersion = getParsedVersion(process.version);
var isNodeValid = (nodeVersion >= 6) && (nodeVersion < 7);
if (!isNodeValid) {
  console.log('NodeJS should be version 6 - current is:', process.version);
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
cp.stdout.on('data', function (data) {
  var npmVersion = getParsedVersion(data.toString());
  var isNpmValid = (npmVersion > 2) && (npmVersion < 4);
  if (!isNpmValid) {
    console.log('npm should be version 3 - current is:', npmVersion);
    console.log('https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/blob/master/docs/setup.md');
    process.exit(1);
  }
});

function getParsedVersion(version) {
  return parseFloat((version || '').replace(/v/, ''));
}
