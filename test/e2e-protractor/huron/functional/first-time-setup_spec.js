import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';

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
});
