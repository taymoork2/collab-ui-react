import * as provisionerHelper from './provisioner.helper';

export function createPstnCustomer(token, customer) {
  const options = {
    method: 'POST',
    uri: `${config.getTerminusServiceUrl()}v2/customers`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customer,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function putE911Signee(token, customerE911) {
  const options = {
    method: 'PUT',
    uri: `${config.getTerminusServiceUrl()}v1/customers/${customerE911.e911Signee}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customerE911,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function addPstnNumbers(token, customerNumbers, uuid) {
  const options = {
    method: 'POST',
    uri: `${config.getTerminusServiceUrl()}v2/customers/${uuid}/numbers/orders`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: customerNumbers,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
