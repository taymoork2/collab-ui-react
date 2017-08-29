import * as _ from 'lodash';
import * as Promise from 'promise';
import * as helper from '../../api_sanity/test_helper';
import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as huronCmiHelper from './huron/provisioner.helper.cmi';
import * as huronPstnHelper from './huron/provisioner.helper.pstn';
import * as huronFeaturesHelper from './huron/provisioner.helper.features';

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
        return huronCmiHelper.provisionCmiCustomer(customer.partner, customer.cmiCustomer, customer.cmiSite, customer.numberRange, customer.doFtsw)
          .then(() => provisionUsers(customer))
          .then(() => huronPstnHelper.setupPSTN(customer))
          .then(() => huronFeaturesHelper.setupHuntGroup(customer))
          .then(() => loginPartner(customer.partner))
          .then(() => switchToCustomerWindow(customer.name, customer.doFtsw));
      } else {
        return loginPartner(customer.partner)
          .then(() => switchToCustomerWindow(customer.name));
      }
    });
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

