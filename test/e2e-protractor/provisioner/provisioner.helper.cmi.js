import * as provisionerHelper from './provisioner.helper';

export function createCmiCustomer(token, customer) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiServiceUrl()}common/customers`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customer,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function createCmiSite(token, customerId, site) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiServiceUrl()}voice/customers/${customerId}/sites`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: site,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function createNumberRange(token, customerId, numberRange) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiServiceUrl()}voice/customers/${customerId}/internalnumberranges`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: numberRange,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
