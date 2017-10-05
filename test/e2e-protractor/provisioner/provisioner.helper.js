import * as helper from '../../api_sanity/test_helper';
const rp = require('request-promise');
// rp.debug = true;
import * as featureToggle from '../utils/featureToggle.utils';

export function getToken(userName) {
  return protractor.promise.controlFlow().execute(() => {
    var bearer;
    return helper.getBearerToken(userName)
      .then(function (_bearer) {
        bearer = _bearer;
      })
      .then(function () {
        return featureToggle.populateFeatureToggles(bearer);
      })
      .then(function () {
        return bearer;
      });
  });
}

export function makeRequest(options) {
  return protractor.promise.controlFlow().execute(() => {
    return rp(options);
  });
}

export function flipFtswFlag(token, orgId) {
  const options = {
    method: 'PATCH',
    uri: `${config.getAdminServiceUrl()}organizations/${orgId}/setup`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return makeRequest(options);
}
