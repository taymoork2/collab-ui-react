var processEnvUtil = require('../gulp/utils/processEnvUtil.gulp')();
var config = require('../gulp/gulp.config')();
var fs = require('fs-extra');
var yargs = require('yargs');
var unparse = require('unparse-args');
var args = yargs.argv;
var _ = require('lodash');
var cp = require('child_process');
var dotenv = require('dotenv');
var uuid = require('uuid');
var tunnelUuid;

var runCounterMax = processEnvUtil.getE2eRunCounterMax();

cleanupOldE2E();
setEnv();
sauceStart();
runE2E();

function retry(exitCode) {
  var retrySpecList;
  var runCounter = processEnvUtil.getE2eRunCounter();
  if (runCounter < runCounterMax && fs.existsSync(config.e2eFailRetry)) {
    console.log('Protractor retry attempt', runCounter);

    // mv default retry file to more specific name correlating to its run
    // ex. './.e2e-fail-retry' -> './cache/e2e-fail-retry-run-0'
    retrySpecList = config.cache + '/' + _.trimLeft(config.e2eFailRetry, '.') + '-run-' + processEnvUtil.getE2eRunCounter();
    fs.renameSync(config.e2eFailRetry, retrySpecList);

    // update the source of specs for the next run
    args.filesFrom = retrySpecList;

    // now we can increment the run counter and re-run
    processEnvUtil.setE2eRunCounter(processEnvUtil.getE2eRunCounter() + 1);
    runE2E();
  } else {
    console.log('Nothing to retry, exiting...');
    sauceStop();
    process.exit(exitCode);
  }
}

function runE2E() {
  var child = cp.fork('./protractor/protractor', unparse(args));
  child.on('exit', retry);
}

function cleanupOldE2E() {
  fs.removeSync(config.e2eFailRetry);
  fs.removeSync(config.e2eFailRetrySpecLists);
  fs.removeSync(config.e2eReports);
}

function sauceStart() {
  if (args.sauce) {
    console.log('Starting sauce connect tunnel...');
    cp.spawnSync('./sauce/start.sh');
    console.log('Sauce connect tunnel complete');
  }
}

function sauceStop() {
  if (args.sauce) {
    console.log('Stopping sauce connect tunnel...');
    cp.spawnSync('./sauce/stop.sh');
    console.log('Sauce connect tunnel terminated');
  }
}

function setEnv() {
  if (args.sauce) {
    dotenv.config({
      path: './test/env/sauce.properties'
    });
    process.env.SC_TUNNEL_IDENTIFIER = tunnelUuid || (tunnelUuid = uuid.v4());
  }
  if (args.prod) {
    dotenv.config({
      path: './test/env/production.properties'
    });
  } else if (args.int) {
    dotenv.config({
      path: './test/env/integration.properties'
    });
  }
}
