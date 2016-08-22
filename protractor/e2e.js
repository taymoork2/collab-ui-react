var processEnvUtil = require('../utils/processEnvUtil')();
var config = require('../config/config');
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
var runCounter = processEnvUtil.getE2eRunCounter();

cleanupOldE2E();
setEnv();
sauceStart();
runE2E(runCounter);

function retry(runCounter, exitCode) {
  var retrySpecList;
  var _runCounter = runCounter;
  if (_runCounter < runCounterMax && fs.existsSync(config.e2eFailRetry)) {
    // mv default retry file to more specific name correlating to its run
    // ex. './.e2e-fail-retry' -> './cache/e2e-fail-retry-run-0'
    retrySpecList = config.cache + '/' + _.trimLeft(config.e2eFailRetry, '.') + '-run-' + processEnvUtil.getE2eRunCounter();
    fs.renameSync(config.e2eFailRetry, retrySpecList);

    // update the source of specs for the next run
    args.filesFrom = retrySpecList;

    // now we can increment the run counter and re-run
    _runCounter += 1;
    runE2E(_runCounter);
  } else {
    console.log('#### Protractor: nothing to retry, exiting...');
    sauceStop();
    process.exit(exitCode);
  }
}

function runE2E(runCounter) {
  // yargs will have already parsed args of the form '--foo-bar', so remove them before forking
  // to 'protractor.js'
  args = _.forEach(args, function (argVal, argName) {
    if (/\w+-\w+/.test(argName)) {
      delete args[argName];
    }
  });
  console.log('#### Protractor: run: ' + runCounter + ': start');
  var child = cp.fork('./protractor/protractor', unparse(args));
  child.on('exit', function (exitCode) {
    console.log('#### Protractor: run: ' + runCounter + ': end');
    retry(runCounter, exitCode);
  });
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
