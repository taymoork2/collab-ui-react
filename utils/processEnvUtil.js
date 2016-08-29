/**
 * Process environment helper functions
 */
'use strict';

module.exports = function () {
  var E2E_RUN_COUNTER = 'E2E_RUN_COUNTER';
  var E2E_RUN_COUNTER_MAX = 'E2E_RUN_COUNTER_MAX';

  return {
    isJenkins: isJenkins,
    setE2eRunCounter: setE2eRunCounter,
    getE2eRunCounter: getE2eRunCounter,
    getE2eRunCounterMax: getE2eRunCounterMax,
    getEnvVarAsInt: getEnvVarAsInt
  };

  ////////////////

  function isJenkins() {
    return process.env.BUILD_NUMBER && process.env.JOB_NAME && process.env.JENKINS_URL;
  }

  function setE2eRunCounter(runCounter) {
    process.env[E2E_RUN_COUNTER] = runCounter;
  }

  function getE2eRunCounter() {
    return getEnvVarAsInt(E2E_RUN_COUNTER);
  }

  function getE2eRunCounterMax() {
    return getEnvVarAsInt(E2E_RUN_COUNTER_MAX);
  }

  function getEnvVarAsInt(varName) {
    return (process.env[varName] && +process.env[varName]) || 0;
  }
};
