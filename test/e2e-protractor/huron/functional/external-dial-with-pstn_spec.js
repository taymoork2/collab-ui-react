import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();

describe('Huron Functional: external-dial-with-pstn', () => {
  const customerOptions = {
    test: 'external-dial-with-pstn',
    pstn: 3,
  };
  const customer = huronCustomer(customerOptions);
  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });
  it('should navigate to call settings page', () => {
    utils.click(navigation.callSettings);
    navigation.expectDriverCurrentUrl('call-settings');
  });

  describe('External Dialing', () => {
    describe('set Outbound Dial Digit', () => {
      it('should show a warning when selecting a number for dialing out that matches first digit of internal prefix range', () => {
        utils.selectDropdown('.csSelect-container[name="steeringDigit"]', '3');
        utils.expectIsDisplayed(callSettings.dialWarning);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should popup warning modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.dialPlanWarningModalTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.dialPlanWarningYesBtn).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should cause warning to go away when selecting a number that does not match first digit of interal prefix range', () => {
        utils.selectDropdown('.csSelect-container[name="steeringDigit"]', '4');
        utils.expectIsNotDisplayed(callSettings.dialWarning);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should popup warning modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.dialPlanWarningModalTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.dialPlanWarningYesBtn).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('set Dialing Preferences', () => {
      it('should default to first option', () => {
        utils.expectIsDisplayed(callSettings.dialOneRadio);
      });
      it('should default to requiring user to dial 1 before area code--checkbox is empty ', () => {
        utils.expectIsDisplayed(callSettings.dialChkbxEmpty);
      });
      it('should allow user to click box to not require user to dial 1 before area code', () => {
        utils.setCheckboxIfDisplayed(callSettings.dialOneChkBx);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should popup warning modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.dialPlanWarningModalTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.dialPlanWarningYesBtn).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should check value of checkbox after saving--checkbox is checked', () => {
        utils.expectIsDisplayed(callSettings.dialChkbxNotEmpty);
      });
      it('should not have a warning requiring PSTN to be set up', () => {
        utils.expectIsNotDisplayed(callSettings.pstnWarning);
      });
      it('should allow user to select simplified local dialing and input an area code and save successfully', () => {
        utils.click(callSettings.simplifiedLocalRadio);
        utils.sendKeys(callSettings.areaCode, '919');
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should popup warning modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.dialPlanWarningModalTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.dialPlanWarningYesBtn).then(() => {
          notifications.assertSuccess();
        });
      });
    });
  });
});
