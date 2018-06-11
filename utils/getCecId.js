'use strict';

/* eslint-env es6 */
const execSync = require('child_process').execSync;

function getCecId() {
  const execCmd = 'git config user.email | cut -d@ -f1 | xargs echo -n';
  return execSync(execCmd, { encoding: 'utf8' });
}

module.exports = getCecId;
