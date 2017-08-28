import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as cmiHelper from './huron/provisioner.helper.cmi';
import * as helper from '../../api_sanity/test_helper';
import * as _ from 'lodash';
import * as Promise from 'promise';
import { PstnCustomer } from './huron/terminus-customers';
import { PstnCustomerE911Signee } from './huron/terminus-customers-customer-e911';
import { PstnNumbersOrders } from './huron/terminus-numbers-orders';
import * as pstnHelper from './huron/provisioner.helper.pstn';

/* global LONG_TIMEOUT */

export function provisionAtlasCustomer(partnerName, trial) {
  return provisionerHelper.getToken(partnerName)
    .then(token => {
      return deleteAtlasCustomerIfFound(token, partnerName, trial.customerName)
        .then(createCustomer => {
          if (createCustomer) {
            console.log(`Creating customer ${trial.customerName} in Atlas...`);
            return atlasHelper.createAtlasCustomer(token, helper.auth[partnerName].org, trial)
              .then(customer => {
                console.log(`${trial.customerName} successfully created in Atlas!`);
                return customer;
              });
          } else {
            console.log(`${trial.customerName} found in Atlas! provisionerKeepCustomer flag is true, skipping create.`);
            return Promise.resolve();
          }
        });
    });
}

export function provisionCmiCustomer(partnerName, customer, site, numberRange, setupWiz) {
  return provisionerHelper.getToken(partnerName)
    .then(token => {
      console.log(`Creating customer ${customer.name} in CMI...`);
      return cmiHelper.createCmiCustomer(token, customer)
        .then(() => {
          console.log(`${customer.name} successfully created in CMI!`);
          console.log('Creating site in CMI...');
          return cmiHelper.createCmiSite(token, customer.uuid, site);
        })
        .then(() => {
          console.log('Site successfully created in CMI!');
          console.log(`Creating number range ${numberRange.name} in CMI...`);
          return cmiHelper.createNumberRange(token, customer.uuid, numberRange);
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


export function provisionCustomerAndLogin(customer) {
  return this.provisionAtlasCustomer(customer.partner, customer.trial)
    .then(atlasCustomer => {
      if (atlasCustomer.offers[0].id == 'MESSAGE') {
        console.log('No offers selected, proceeding without CMI setup!');
        return loginPartner(customer.partner)
          .then(() => switchToCustomerWindow(customer.name, customer.doFtsw));
      } else if (atlasCustomer && customer.cmiCustomer) {
        customer.cmiCustomer.uuid = atlasCustomer.customerOrgId;
        customer.cmiCustomer.name = atlasCustomer.customerName;
        return this.provisionCmiCustomer(customer.partner, customer.cmiCustomer, customer.cmiSite, customer.numberRange, customer.doFtsw)
          .then(() => provisionUsers(customer))
          .then(() => setupPSTN(customer))
          .then(() => setupHuntGroup(customer))
          .then(() => loginPartner(customer.partner))
          .then(() => switchToCustomerWindow(customer.name, customer.doFtsw));
      } else {
        return loginPartner(customer.partner)
          .then(() => switchToCustomerWindow(customer.name));
      }
    });
}

export function setupPSTN(customer) {
  if (customer.pstn) {
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Creating PSTN customer');
        var obj = {};
        obj.firstName = customer.cmiCustomer.name;
        obj.email = customer.trial.customerEmail;
        obj.uuid = customer.cmiCustomer.uuid;
        obj.name = customer.name;
        obj.resellerId = helper.auth[customer.partner].org;
        const pstnCustomer = new PstnCustomer(obj);
        return pstnHelper.createPstnCustomer(token, pstnCustomer)
          .then(() => {
            console.log('Adding e911 signature to customer');
            obj = {};
            obj.firstName = customer.cmiCustomer.name;
            obj.email = customer.trial.customerEmail;
            obj.name = customer.name;
            obj.e911Signee = customer.cmiCustomer.uuid;
            const pstnCustomerE911 = new PstnCustomerE911Signee(obj);
            return pstnHelper.putE911Signee(token, pstnCustomerE911)
              .then(() => {
                console.log('Adding phone numbers to customer');
                obj = {};
                obj.numbers = customerNumbersPSTN(customer.pstnLines);
                const pstnNumbersOrders = new PstnNumbersOrders(obj);
                return pstnHelper.addPstnNumbers(token, pstnNumbersOrders, customer.cmiCustomer.uuid);
              });
          });
      });
  }
}

export function customerNumbersPSTN(number) {
  var prevNumber = 0;
  var pstnNumbers = [];
  for (var i = 0; i < number; i++) {
    var numbers = numberPSTN(prevNumber);
    prevNumber = numbers[1];
    pstnNumbers.push(numbers[0]);
  }
  return pstnNumbers;
}

export function numberPSTN(prevNumber) {
  var date = Date.now();
  // If created at same millisecond as previous
  if (date <= prevNumber) {
    date = ++prevNumber;
  } else {
    prevNumber = date;
  }
  // get last 10 digits from date and format into PSTN number
  date = date.toString();
  date = ('+1919' + date.substr(date.length - 7));
  console.log('Added Phone Number: ' + date);
  return [date, prevNumber];
}

export function tearDownAtlasCustomer(partnerName, customerName) {
  if (!provisionerKeepCustomer) {
    return provisionerHelper.getToken(partnerName)
      .then(token => {
        return deleteAtlasCustomerIfFound(token, partnerName, customerName);
      });
  } else {
    console.log('provisionerKeepCustomer flag is true, skipping delete.');
    return Promise.resolve();
  }
}

function deleteAtlasCustomerIfFound(token, partnerName, customerName) {
  return atlasHelper.findAtlasCustomer(token, helper.auth[partnerName].org, customerName)
    .then(response => {
      console.log(`Searching for ${customerName} in Atlas...`);
      const managedOrgs = _.get(response, 'organizations', undefined);
      if (_.isArray(managedOrgs) && managedOrgs.length > 0) {
        if (!provisionerKeepCustomer) {
          console.log(`${customerName} found in Atlas!  Deleting...`);
          return atlasHelper.deleteAtlasCustomer(token, managedOrgs[0].customerOrgId)
            .then(() => {
              console.log(`${customerName} successfully deleted from Atlas!`);
              return true;
            });
        } else {
          console.log(`${customerName} found in Atlas! provisionerKeepCustomer flag is true, skipping delete.`);
          return false;
        }
      } else {
        console.log(`${customerName} not found in Atlas!`);
        return true;
      }
    });
}

export function loginPartner(partnerEmail) {
  return login.login(partnerEmail, '#/partner/customers');
}

function switchToCustomerWindow(customerName, doFtsw) {
  utils.click(element(by.cssContainingText('.ui-grid-cell', customerName)));
  utils.click(partner.launchCustomerPanelButton);
  return utils.switchToNewWindow().then(() => {
    if (!doFtsw) {
      return utils.wait(navigation.tabs, LONG_TIMEOUT);
    } else {
      return utils.wait(navigation.ftswSidePanel, LONG_TIMEOUT);
    }
  });
}

export function provisionUsers(customer) {
  if (customer.users) {
    console.log(`Need to provision ${customer.users} users for ${customer.name}!`);
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Got token for provisionUsers!');
        return atlasHelper.getAtlasOrg(token, customer.cmiCustomer.uuid)
          .then((response) => {
            const licenseArray = _.get(response, 'licenses', undefined);
            const licenseCom = _.find(licenseArray, ['licenseType', 'COMMUNICATION']);
            console.log('Got communication type of license for provisionUsers!');
            let internalExt = 351;
            let userList = [];
            for (var i = 0; i < customer.users; i++) {
              internalExt = internalExt + i;
              const userObj = {
                email: `${customer.name}_${i}@gmail.com`,
                userEntitlements: null,
                licenses: [{
                  id: `${licenseCom.licenseId}`,
                  OperationId: 'ADD',
                  properties: { internalExtension: `${internalExt}` },
                },
                ],
              }
              userList.push(userObj);
            }

            let finalList = { users: userList }

            return atlasHelper.createAtlasUser(token, customer.cmiCustomer.uuid, finalList)
              .then(() => {
                console.log(`Successfully added users for ${customer.name}!`);
              });
          });
      });
  }
}

export function setupHuntGroup(customer) {
  const huntGroupName = `${customer.name}_HG`
  const memberEmail = `${customer.name}_0@gmail.com`
  const fallbackEmail = `${customer.name}_1@gmail.com`
  const huntingType = 'DA_LONGEST_IDLE_TIME'
  const huntPilotDN = '310'
  const dn_type = 'NUMBER_FORMAT_EXTENSION'
  let tempArray = ''
  let memberUUID = ''
  let fallbackUUID = ''
  if (customer.doHuntGroup) {
    console.log(`Need to provision hunt group for ${customer.name}!`);
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Got token for provisionUsers!');
        console.log('Get UUID of member')
        return cmiHelper.getMemberUUID(token, customer.cmiCustomer.uuid, `${memberEmail}`)
          .then((response) => {
            tempArray = _.find(_.get(response, 'members', undefined), ['userName', `${memberEmail}`]);
            memberUUID = tempArray.numbers[0].uuid
            console.log(`Got UUID of member ${memberUUID}`)
            console.log('Get UUID of fallback Destination')
            return cmiHelper.getMemberUUID(token, customer.cmiCustomer.uuid, `${fallbackEmail}`)
              .then((response) => {
                tempArray = _.find(_.get(response, 'members', undefined), ['userName', `${fallbackEmail}`]);
                fallbackUUID = tempArray.numbers[0].uuid
                console.log(`Got UUID of fallback destination ${fallbackUUID}`)
                console.log('prepare post for hunt group and post it!')
                var hgBody = {
                  fallbackDestination: {
                    numberUuid: `${fallbackUUID}`,
                    sendToVoicemail: false,
                  },
                  huntMethod: `${huntingType}`,
                  members: [
                    `${memberUUID}`,
                  ],
                  name: `${huntGroupName}`,
                  numbers: [{
                    number: `${huntPilotDN}`,
                    type: `${dn_type}`,
                  }],
                }
                return cmiHelper.createCmiHuntGroup(token, customer.cmiCustomer.uuid, hgBody)
                  .then(() => {
                    console.log(`Successfully added hunt group for ${customer.name}!`);
                  });
              });
          });
      });
  }
}
