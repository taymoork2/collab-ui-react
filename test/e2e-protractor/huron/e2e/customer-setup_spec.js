import * as provisioner from '../../provisioner/provisioner';
import { CustomerSetupPage } from '../pages/customerSetup.page';
import * as os from 'os';
const customerSetup = new CustomerSetupPage();
/* globals partner, navigation, utils*/

describe('Huron Functional: e2e-customer-setup', () => {
  const testPartner = 'huron-ui-test-partner';
  const CUSTOMER_NAME = `${os.userInfo().username}_add-user`;
  const CUSTOMER_EMAIL = `huron.ui.test.partner+${CUSTOMER_NAME}@gmail.com`;

  beforeAll(done => {
    provisioner.loginPartner(testPartner)
    .then(done);
  });
   afterAll(done => {
    provisioner.tearDownAtlasCustomer(testPartner, CUSTOMER_NAME).then(done);
  });

  it('should navigate to the customers overview page', () => {
    utils.expectIsDisplayed(partner.customerList);
    navigation.expectDriverCurrentUrl('customers');
  });
  it('should navigate to start trial view', () => {
    utils.click(partner.addButton);
    utils.expectIsDisplayed(customerSetup.customerInformation.title);
    utils.expectIsDisplayed(customerSetup.trialServices.title);
    utils.expectIsDisplayed(customerSetup.licensesQuantity.title);
    utils.expectIsDisplayed(customerSetup.trialDuration.title);
    utils.expectIsDisplayed(customerSetup.regionalSettings.title);
    utils.expectIsDisplayed(customerSetup.nonTrialServices.title);
  });
  it('should enter valid company information', () => {
    utils.sendKeys(partner.customerNameInput, CUSTOMER_NAME);
    utils.sendKeys(partner.customerEmailInput, CUSTOMER_EMAIL);
    utils.click(partner.validLocationCheckbox);
    utils.click(partner.messageTrialCheckbox);
    utils.click(customerSetup.trialServices.checkbox.meetingTrial);
    utils.click(partner.webexTrialCheckbox);
    utils.click(partner.careTrialCheckbox);
    utils.click(partner.roomSystemsTrialCheckbox);
    utils.click(customerSetup.regionalSettings.dropdown.country);
    utils.selectDropdown('.csSelect-container[name="\'defaultCountry\'"]', 'United States');
  });
  /**
   * should enter valid company information
   * should check certification check box
   * should un-check all services EXCEPT Call
   * should select United State for country
   * should navigate to the 
   */
});
