import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';

describe('Huron Functional: first-time-setup', () => {
  const customerOptions = {
    test: 'ftw-msg-only',
    offers: ['MESSAGE'],
    doFtsw: true,
  };
  const customer = huronCustomer(customerOptions);
  const now = Date.now();

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer).then(done);
  });
  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should navigate to First Time Setup Wizard', () => {
    utils.expectIsDisplayed(wizard.titleBanner);
  });

  describe('No services to setup, therefor check that trial banners are in the correct place', () => {
    it('should have "Start your new 90-day trial" banner showing for message', () => {
      utils.expectIsDisplayed(wizard.planReviewMessagesTrial);
    });
    it('should not have "Start your new 90-day trial" banner showing for meetings', () => {
      utils.expectIsNotDisplayed(wizard.planReviewMeetingsTrial);
    });
    it('should not have "Start your new 90-day trial" banner showing for call', () => {
      utils.expectIsNotDisplayed(wizard.planReviewCallTrial);
    });
  });

  describe('Finalize first time wizard setup', () => {
    const SUBDOMAIN = `ftwTestWizard${now}`;
    it('should click on get started button to progress to next screen', () => {
      utils.click(wizard.beginBtn);
    });
    it('should clear input for Webex domain on Cancel', () => {
      utils.sendKeys(wizard.sipInput, SUBDOMAIN);
      utils.click(wizard.cancelBtn);
    });
    it('should set up a Webex domain', () => {
      utils.sendKeys(wizard.sipInput, SUBDOMAIN);
    });
    it('should check availability of domain', () => {
      utils.click(wizard.checkAvailabilityBtn);
      utils.expectIsDisplayed(wizard.checkAvailabilitySuccess);
    });
    it('should click Next button', () => {
      utils.waitUntilEnabled(wizard.beginBtn, 6000)
        .then(() => utils.click(wizard.beginBtn));
    });
    it('should land on a finalized page', () => {
      utils.expectIsDisplayed(wizard.getStartedBanner);
    });
    it('should click on Finish button', () => {
      utils.click(wizard.beginBtn);
    });
    it('should land on Control Hub Overview', () => {
      navigation.expectDriverCurrentUrl('overview');
    });
  });
});
