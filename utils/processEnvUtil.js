/**
 * Process environment helper functions
 */

'use strict';

const _ = require('lodash');

module.exports = function () {
  const E2E_RUN_COUNTER = 'E2E_RUN_COUNTER';
  const E2E_RUN_COUNTER_MAX = 'E2E_RUN_COUNTER_MAX';
  const WP__ENABLE_DLL = 'WP__ENABLE_DLL';

  return {
    isJenkins: isJenkins,
    setE2eRunCounter: setE2eRunCounter,
    getE2eRunCounter: getE2eRunCounter,
    getE2eRunCounterMax: getE2eRunCounterMax,
    getEnvVarAsInt: getEnvVarAsInt,
    hasEnabledDll: hasEnabledDll,
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

  function hasEnabledDll() {
    const enableDll = _.get(process.env, WP__ENABLE_DLL);
    return /(1|true)/i.test(enableDll);
  }
};
