import * as _ from 'lodash';
import * as Promise from 'promise';
import * as helper from '../../api_sanity/test_helper';
import * as provisionerHelper from './provisioner.helper';
import * as atlasHelper from './provisioner.helper.atlas';
import * as huronCmiHelper from './huron/provisioner.helper.cmi';
import * as huronPstnHelper from './huron/provisioner.helper.pstn';
import * as huronFeaturesHelper from './huron/provisioner.helper.features';
import * as atlasUser from './atlas-users-config';

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
      customer.orgId = atlasCustomer.customerOrgId;
      if (atlasCustomer && customer.callOptions) {
        customer.callOptions.cmiCustomer.uuid = atlasCustomer.customerOrgId;
        customer.callOptions.cmiCustomer.name = atlasCustomer.customerName;
        return huronCmiHelper.provisionCmiCustomer(customer.partner, customer.callOptions.cmiCustomer, customer.callOptions.cmiSite, customer.callOptions.numberRange, customer.doFtsw, customer.doCallPickUp, customer.doHuntGroup)
          .then(() => huronPstnHelper.setupPSTN(customer))
          .then(() => provisionPlaces(customer))
          .then(() => provisionUsers(customer))
          .then(() => huronFeaturesHelper.setupHuntGroup(customer))
          .then(() => huronFeaturesHelper.setupCallPickup(customer))
          .then(() => huronFeaturesHelper.setupCallPark(customer))
          .then(() => huronFeaturesHelper.setupCallPaging(customer))
          .then(() => loginPartner(customer.partner))
          .then(() => switchToCustomerWindow(customer.name, customer.doFtsw));
      } else {
        return loginPartner(customer.partner)
          .then(() => switchToCustomerWindow(customer.name, customer.doFtsw));
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
  utils.waitForSpinner();
  utils.click(element(by.css('i.icon-search')));
  utils.sendKeys(element(by.id('searchFilter')), customerName);
  utils.waitForSpinner()
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
    console.log(`Onboarding users for ${customer.name}!`);
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        return atlasHelper.getAtlasOrg(token, customer.orgId)
          .then(response => {
            const licenseArray = _.get(response, 'licenses', undefined);
            const users = { users: atlasUser.atlasUsers(customer, licenseArray) };
            return atlasHelper.createAtlasUser(token, customer.orgId, users)
              .then(() => {
                console.log(`Successfully onboarded users for ${customer.name}!`);
              });
          });
      });
  }
}

function provisionPlaces(customer) {
  if (customer.places) {
    console.log('Creating places');
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        createPlaceObj(token, customer.orgId, customer.places);
        console.log('Successfully added places');
      });
  }
}

function createPlaceObj(tkn, id, plObj) {
  let placeObj = {};
  for (let i = 0; i < plObj.length; i++) {
    placeObj[i] = plObj[i];
    createNewPlace(tkn, id, placeObj[i]);
  }
}

function createNewPlace(tkn, id, plObj) {
  return atlasHelper.createAtlasPlace(tkn, id, plObj)
}
