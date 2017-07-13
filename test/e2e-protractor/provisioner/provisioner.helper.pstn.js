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

export function putE911Signee(token, customer) {
  const options = {
    method: 'PUT',
    uri: `${config.getTerminusServiceUrl()}v1/customers/${customer.uuid}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customer,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function addPstnNumbers(token, customer) {
  const options = {
    method: 'POST',
    uri: `${config.getTerminusServiceUrl()}v2/customers/${customer.uuid}/numbers/orders`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: customer,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
