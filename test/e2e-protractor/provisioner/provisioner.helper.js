import * as helper from '../../api_sanity/test_helper';
const rp = require('request-promise');
// rp.debug = true;

export function getToken(userName) {
  return protractor.promise.controlFlow().execute(() => {
    return helper.getBearerToken(userName);
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
      'Authorization': `Bearer  ${token}`,
    },
    json: true,
  };
  return makeRequest(options);
}
