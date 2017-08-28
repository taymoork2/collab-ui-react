import * as provisionerHelper from '../provisioner.helper';

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

export function getUUIDForDN(token, customerId, DN) {
  const options = {
    method: 'GET',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/numbers?assigned=false&number=${DN}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function getMemberUUID(token, customerId, email) {
  const options = {
    method: 'GET',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/members?name=${email}&wide=true`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function createCmiHuntGroup(token, customerId, hgBody) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/features/huntgroups`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: hgBody,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
