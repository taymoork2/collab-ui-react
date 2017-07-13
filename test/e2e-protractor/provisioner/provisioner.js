import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as cmiHelper from './provisioner.helper.cmi';
import * as helper from '../../api_sanity/test_helper';
import * as _ from 'lodash';
import * as Promise from 'promise';
import { PstnCustomer } from './pstn-customer';
import * as pstnHelper from './provisioner.helper.pstn';

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


export function provisionCustomerAndLogin(customer) {
  return this.provisionAtlasCustomer(customer.partner, customer.trial)
    .then(atlasCustomer => {
      if (atlasCustomer && customer.cmiCustomer) {
        customer.cmiCustomer.uuid = atlasCustomer.customerOrgId;
        customer.cmiCustomer.name = atlasCustomer.customerName;
        return this.provisionCmiCustomer(customer.partner, customer.cmiCustomer, customer.cmiSite, customer.numberRange)
          .then(() => setupPSTN(customer))
          .then(() => loginPartner(customer.partner))
          .then(() => switchToCustomerWindow(customer.name));
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
        const obj = {};
        obj.firstName = customer.cmiCustomer.name;
        obj.email = customer.trial.customerEmail;
        obj.uuid = customer.cmiCustomer.uuid;
        obj.resellerId = helper.auth[customer.partner].org;
        const pstnCustomer = new PstnCustomer(obj);
        return pstnHelper.createPstnCustomer(token, pstnCustomer)
          .then(() => {
            console.log('Adding e911 signature to customer');
            pstnCustomer.e911Signee = customer.cmiCustomer.uuid;
            return pstnHelper.putE911Signee(token, pstnCustomer)
              .then(() => {
                console.log('Adding phone numbers to customer');
                pstnCustomer.numbers = ['19193922000', '14692550000', '14084339465'];
                return pstnHelper.addPstnNumbers(token, pstnCustomer);
              });
          });
      });
  }
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

function switchToCustomerWindow(customerName) {
  utils.click(element(by.cssContainingText('.ui-grid-cell', customerName)));
  utils.click(partner.launchCustomerPanelButton);
  return utils.switchToNewWindow().then(() => {
    return utils.wait(navigation.tabs, LONG_TIMEOUT);
  });
}

