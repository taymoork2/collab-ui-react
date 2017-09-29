import * as provisionerHelper from '../provisioner.helper';

export function provisionCmiCustomer(partnerName, customer, site, numberRange, setupWiz) {
  return provisionerHelper.getToken(partnerName)
    .then(token => {
      console.log(`Creating customer ${customer.name} in CMI...`);
      return createCmiCustomer(token, customer)
        .then(() => {
          console.log(`${customer.name} successfully created in CMI!`);
          console.log('Creating site in CMI...');
          return createCmiSite(token, customer.uuid, site);
        })
        .then(() => {
          console.log('Site successfully created in CMI!');
          console.log(`Creating number range ${numberRange.name} in CMI...`);
          return createNumberRange(token, customer.uuid, numberRange);
        })
        .then(() => {
          if (!setupWiz) {
            console.log('Number Range successfully created in CMI!');
            return provisionerHelper.flipFtswFlag(token, customer.uuid);
          } else {
            return Promise.resolve();
          }
        });
    });
}

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

export function createCallPickup(token, customerId, pickupBody) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/features/callpickups?wide=true`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: pickupBody,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function createCallPark(token, customerId, callParkBody) {
  const options = {
    method: 'POST',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/features/callparks`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: callParkBody,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function getUserUUID(token, customerId, value) {
  const options = {
    method: 'GET',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/members?limit=3&name=${value}&wide=false`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function getNumberUUID(token, customerId, userUUID) {
  const options = {
    method: 'GET',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/users/${userUUID}/numbers`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function getPlaceUUID(token, customerId, value) {
  const options = {
    method: 'GET',
    uri: `${config.getCmiV2ServiceUrl()}customers/${customerId}/places?limit=3&name=${value}&wide=false`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function createCallPaging(token, orgId, paging) {
  const options = {
    method: 'POST',
    uri: `${config.getPagingServiceUrl()}customers/${orgId}/pagingGroups`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: paging,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}
