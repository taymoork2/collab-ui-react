import * as provisionerHelper from './provisioner.helper';

export function createAtlasCustomer(token, orgId, atlasTrial) {
  const options = {
    method: 'POST',
    uri: `${config.getAdminServiceUrl()}organization/${orgId}/trials`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: atlasTrial,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
};

export function deleteAtlasCustomer(token, customerId) {
  const options = {
    method: 'DELETE',
    uri: `${config.getAdminServiceUrl()}organizations/${customerId}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function findAtlasCustomer(token, orgId, customerName) {
  const options = {
    method: 'GET',
    uri: `${config.getAdminServiceUrl()}organizations/${orgId}/managedOrgs`,
    qs: {
      customerName: customerName,
    },
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function getAtlasOrg(token, orgId) {
  const options = {
    method: 'GET',
    uri: `${config.getAdminServiceUrl()}organizations/${orgId}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
