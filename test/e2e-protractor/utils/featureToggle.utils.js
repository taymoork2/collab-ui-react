var _ = require('lodash');
var config = require('./test.config');
var utils = require('./test.utils');
var featureToggleMap = require('../../../app/modules/core/featureToggle/features.config');
var token;

// initialize all tracked features to false
exports.features = _.mapValues(featureToggleMap, function () {
  return false;
});
exports.populateFeatureToggles = populateFeatureToggles;

function populateFeatureToggles(_token) {
  token = _token;
  unsetFeatureToggles();
  return browser.wait(function () {
    return getMe()
      .then(fetchFeatureToggles)
      .then(setFeatureToggles)
      .catch(_.noop)
      .then(resolveBrowserWait);
  }, 5000, 'Could not retrieve feature toggles');
}

function getMe() {
  var options = {
    method: 'get',
    url: config.getScimUrl() + 'me',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return sendRequest(options)
    .then(function (response) {
      return _.get(response, 'id');
    });
}

function fetchFeatureToggles(userUuid) {
  var options = {
    method: 'get',
    url: config.getFeatureServiceUrl() + 'features/users/' + userUuid + '/developer',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  };

  return sendRequest(options)
    .then(function (response) {
      return _.get(response, 'featureToggles', []);
    });
}

function setFeatureToggles(featureToggles) {
  _.forEach(exports.features, function (featureKey, atlasFeatureName) {
    _.set(exports.features, atlasFeatureName, getFeatureToggleValue(featureToggles, atlasFeatureName));
  });
}

function unsetFeatureToggles() {
  _.forEach(exports.features, function (featureKey, atlasFeatureName) {
    _.set(exports.features, atlasFeatureName, false);
  });
}

function getFeatureToggleValue(featureToggles, atlasFeatureName) {
  return fixBooleanValues(_.get(_.find(featureToggles, {
    key: featureToggleMap[atlasFeatureName],
  }), 'val'));
}

function fixBooleanValues(value) {
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    return value;
  }
}

function resolveBrowserWait() {
  return true;
}

function sendRequest(options) {
  return utils.sendRequest(options)
    .then(function (response) {
      return JSON.parse(response);
    });
}
