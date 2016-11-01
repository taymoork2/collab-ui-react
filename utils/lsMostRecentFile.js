'use strict';

const execSync = require('child_process').execSync;

function lsMostRecentFile(bashGlobPath) {
  if (!bashGlobPath) {
    return '';
  }

  const execCmd = `ls -1tr ${bashGlobPath} | tail -1 | xargs basename | xargs echo -n`;
  return execSync(execCmd, { encoding: 'utf8' });
}

module.exports = lsMostRecentFile;
