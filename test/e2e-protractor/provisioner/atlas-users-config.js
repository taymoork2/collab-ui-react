import * as _ from 'lodash';

export class User {
  constructor(obj = {
    email: undefined,
    name: undefined,
    userEntitlements: undefined,
    licenses: undefined,
  }) {
    this.email = obj.email;
    this.name = obj.name;
    this.userEntitlements = obj.userEntitlements || null;
    this.licenses = obj.licenses;
  }
}

function getLicenses(licenseArray, user) {
  const licenses = [];
  _.forEach(licenseArray, license => {
    if (license.licenseType === 'COMMUNICATION' && user.callOptions) {
      var callProperties = {
        internalExtension: _.get(user.callOptions, 'internalExtension') || undefined,
        directLine: _.get(user.callOptions, 'directLine') || undefined,
        location: _.get(user.callOptions, 'location') || undefined,
      };
    }
    const licenseObject = {
      id: license.licenseId,
      idOperation: 'ADD',
      properties: callProperties || undefined,
    };
    licenses.push(licenseObject);
  });
  return licenses;
}

function createUserList(customer, licenseArray) {
  return _.map(customer.users, user => {
    user.licenses = getLicenses(licenseArray, user);
    return new User(user);
  })
}

export function atlasUsers(customer, licenseArray) {
  const userList = createUserList(customer, licenseArray);
  return userList;
}
