import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';

describe('Huron Functional: first-time-setup', () => {
  const customer = huronCustomer('ftw-no-call-no-room', null, null, null, null, true, 'NONE');
  //huronCustomer(<customer_Name>, numberRange, users, hasPSTN, noOfLines, dofix FTW, offers)

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer, false).then(done);
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
});
