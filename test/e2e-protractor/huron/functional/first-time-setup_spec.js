import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();

/* global LONG_TIMEOUT */

describe('Huron Functional: first-time-setup', () => {
  const customer = huronCustomer('first-time-setup', null, null, null, null, true);

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer, false).then(done);
  });
  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should navigate to First Time Setup Wizard', () => {
    utils.expectIsDisplayed(wizard.titleBanner);
  });
  it('should navigate to Call Settings setup page', () => {
    utils.click(wizard.beginBtn);
    utils.expectIsDisplayed(wizard.callBanner);
  });

  describe('Call Settings', () => {
    describe('Time Zone and Preferred Language', () => {
      const newPreferredLanguage = 'English (United Kingdom)';
      const oldPreferredLanguage = 'English (United States)';
      const newTimeZone = 'America/New York';
      it('should change Time Zone to America/New York', () => {
        utils.expectIsDisplayed(wizard.timeZoneDropdown);
        utils.selectDropdown('.csSelect-container[name="timeZone"]', newTimeZone);
      });
      it('should be able to select English (United Kingdom) from dropdown', () => {
        utils.expectIsDisplayed(wizard.preferredLanguageDropdown);
        utils.selectDropdown('.csSelect-container[name="preferredLanguage"]', newPreferredLanguage);
      });
      it('should be able to select English (United States) from dropdown', () => {
        utils.selectDropdown('.csSelect-container[name="preferredLanguage"]', oldPreferredLanguage);
      });
    });
  });

  describe('Internal Dialing', () => {
    describe('Routing Prefix', () => {
      const DIAL_PREFIX_KEYS = '1234';
      it('should show a routing prefix input when "Reserve a Prefix" radio is checked', () => {
        utils.click(callSettings.reservePrefixRadio);
        utils.expectIsDisplayed(callSettings.dialingPrefixInput, LONG_TIMEOUT);
      });
      it('should enable save button when valid entry is entered', () => {
        utils.expectIsDisabled(wizard.beginBtn);
        utils.sendKeys(callSettings.dialingPrefixInput, DIAL_PREFIX_KEYS);
        utils.expectIsEnabled(wizard.beginBtn);
      });
    });
    describe('Extension Length', () => {
      const BEGIN_RANGE = '400';
      const END_RANGE = '499';
      it('should display extension range inputs when "Add Extension Range" link is clicked', () => {
        utils.click(callSettings.addExtensionRangeBtn);
        utils.expectIsDisplayed(callSettings.beginRange, LONG_TIMEOUT);
        utils.expectIsDisplayed(callSettings.endRange, LONG_TIMEOUT);
      });
      it('should enable save button when valid entries are entered', () => {
        utils.expectIsDisabled(wizard.beginBtn);
        utils.sendKeys(callSettings.beginRange, BEGIN_RANGE);
        utils.sendKeys(callSettings.endRange, END_RANGE);
        utils.waitUntilEnabled(wizard.beginBtn).then(() => {
          utils.expectIsEnabled(wizard.beginBtn);
        });
      });
      describe('increase extension length', () => {
        const PREFIX_INPUT = '3000';
        const SUFFIX_INPUT = '3099';
        it('should display a warning dialog when extension length is increased', () => {
          utils.selectDropdown('.csSelect-container[name="extensionLength"]', '4');
          utils.expectIsDisplayed(wizard.extensionLengthWarning, LONG_TIMEOUT);
        });
        it('should remove the first set of extension ranges', () => {
          utils.click(wizard.extensionLengthTrash);
        })
        it('should enable save button when valid entries are entered', () => {
          utils.expectIsDisabled(wizard.beginBtn);
          wizard.extensionLengthPrefixInput.clear();
          utils.sendKeys(wizard.extensionLengthPrefixInput, PREFIX_INPUT);
          wizard.extensionLengthSuffixInput.clear();
          utils.sendKeys(wizard.extensionLengthSuffixInput, SUFFIX_INPUT);
          utils.waitUntilEnabled(wizard.beginBtn).then(() => {
            utils.expectIsEnabled(wizard.beginBtn);
          });
        });
      });
    });
  });
});

