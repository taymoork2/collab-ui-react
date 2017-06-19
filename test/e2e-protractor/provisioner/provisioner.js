import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as cmiHelper from './provisioner.helper.cmi';
import * as helper from '../../api_sanity/test_helper';
import * as _ from 'lodash';
import * as Promise from 'promise';

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
          }
        });
    });
}

export function provisionCmiCustomer(partnerName, customer, site, numberRange) {
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
          console.log('Number Range successfully created in CMI!');
          return provisionerHelper.flipFtswFlag(token, customer.uuid);
        });
    });
}

export function provisionCustomerAndLogin(partnerName, trial, cmiCustomer, site, numberRange) {
  return this.provisionAtlasCustomer(partnerName, trial)
    .then(atlasCustomer => {
      if (cmiCustomer) {
        cmiCustomer.uuid = atlasCustomer.customerOrgId;
        cmiCustomer.name = atlasCustomer.customerName;
        return this.provisionCmiCustomer(partnerName, cmiCustomer, site, numberRange)
          .then(() => loginPartner(partnerName))
          .then(() => switchToCustomerWindow(trial.customerName));
      } else {
        return loginPartner(partnerName)
          .then(() => switchToCustomerWindow(trial.customerName));
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
    })
}

function loginPartner(partnerEmail) {
  return login.login(partnerEmail, '#/partner/customers');
}

function switchToCustomerWindow(customerName) {
  utils.click(element(by.cssContainingText('.ui-grid-cell', customerName)));
  utils.click(partner.launchCustomerPanelButton);
  return utils.switchToNewWindow().then(() => {
    return utils.wait(navigation.tabs, LONG_TIMEOUT);
  });
}
