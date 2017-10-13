const isWindows = /^win/.test(process.platform);

const spawnSync = require('child_process').spawnSync;
let response;
if (isWindows) {
  response = spawnSync('cmd', ['/c', 'yarn', 'versions', '--json'], {
    encoding: 'utf-8',
  });
} else {
  response = spawnSync('yarn', ['versions', '--json'], {
    encoding: 'utf-8',
  });
}

const error = response.error || response.stderr;

if (error) {
  console.error(`
[ERROR] Unable to determine versions.

[ERROR] ${error}`);
  printUpdateYarnMessage();
  exitWithError();
}

const versionObj = JSON.parse(response.stdout).data;
const yarnVersion = parseFloat(versionObj.yarn);
const nodeVersion = parseFloat(versionObj.node);

const isYarnValid = yarnVersion >= 1;
const isNodeValid = (nodeVersion >= 6) && (nodeVersion < 7);

if (!isYarnValid) {
  console.error(`
[ERROR] Yarn version should be >= 1. Current: ${yarnVersion}`);
  printUpdateYarnMessage();
  exitWithError();
}

if (!isNodeValid) {
  console.error(`
[ERROR] Node.js should be current LTS (v6). Current: ${nodeVersion}

Please see setup documentation for more information.
https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/blob/master/docs/setup.md
  `);
  exitWithError();
}

function printUpdateYarnMessage() {
  console.error(`
Please update to the latest version of Yarn.
https://yarnpkg.com/lang/en/docs/install/
  `);
}

function exitWithError() {
  process.exit(1);
}
