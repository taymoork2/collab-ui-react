import * as provisioner from '../../provisioner/provisioner';
import * as os from 'os';
import { AtlasTrial, TrialOffer, Offers } from '../../provisioner/atlas-trial';
import { CmiCustomer } from '../../provisioner/cmi-customer';
import { CmiSite } from '../../provisioner/cmi-site';
import { CmiNumberRange } from '../../provisioner/cmi-number-range';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();

describe('Huron Functional: voicemail', () => {
  const testPartner = 'huron-ui-test-partner';
  let customerName;

  beforeAll(done => {
    customerName = `${os.userInfo().username}_voicemail`;

    let offers = [];
    offers.push(new TrialOffer({
      id: Offers.OFFER_CALL,
      licenseCount: 100,
    }));
    offers.push(new TrialOffer({
      id: Offers.OFFER_ROOM_SYSTEMS,
      licenseCount: 5,
    }));

    const trial = new AtlasTrial({
      customerName: customerName,
      customerEmail: `huron.ui.test.partner+${customerName}@gmail.com`,
      offers: offers,
    });

    const numberRange = new CmiNumberRange({
      beginNumber: '300',
      endNumber: '399',
    });

    provisioner.provisionCustomerAndLogin(testPartner, trial, new CmiCustomer(), new CmiSite(), numberRange)
     .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(testPartner, customerName).then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });
  it('should navigate to call settings page', () => {
    utils.click(navigation.callSettings);
    navigation.expectDriverCurrentUrl('call-settingsnew');
  });

  describe('Voicemail', () => {
    describe('Activate voicemail', () => {
      it('should default to inactive', () => {
        utils.expectSwitchState(callSettings.voicemailSwitch, false);
      });
      it('should switch to active on click', () => {
        utils.click(callSettings.voicemailSwitch);
        utils.expectSwitchState(callSettings.voicemailSwitch, true);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should popup notification modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          notifications.assertSuccess();
          utils.expectIsDisplayed(callSettings.voicemailWarningModalTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.voicemailModalDoneButton);
      });
    });

    describe('Voicemail settings', () => {
      it('should default to not having External Voicemail Access', () => {
        utils.scrollIntoView(callSettings.externalVoicemailCheckBox);
        expect(utils.getCheckboxVal(callSettings.externalVoicemailCheckBox)).toBeFalsy();
      });
      it('should display a dropdown to select a phone number for external voicemail access when activated', () => {
        utils.setCheckboxIfDisplayed(callSettings.externalVoicemailCheckBox, true, 1000);
        utils.expectIsDisplayed(callSettings.externalVoicemailDropdown);
      });
      it('should disable External Voicemail Access when box is unchecked', () => {
        utils.setCheckboxIfDisplayed(callSettings.externalVoicemailCheckBox, false, 1000);
        expect(utils.getCheckboxVal(callSettings.externalVoicemailCheckBox)).toBeFalsy();
      });
      it('should default to not having Voicemail to Email', () => {
        expect(utils.getCheckboxVal(callSettings.voicemailToEmailCheckBox)).toBeFalsy();
      });
      it('should allow Voicemail to Email when box is checked', () => {
        utils.setCheckboxIfDisplayed(callSettings.voicemailToEmailCheckBox, true, 1000);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(callSettings.saveButton);
      });
      it('should save successfully', () => {
        utils.click(callSettings.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Turn off Voicemail settings', () => {
      it('should switch to inactive on click', () => {
        utils.click(callSettings.voicemailSwitch);
      });
      it('should enable save button when switched to inactive', () => {
        utils.expectIsDisplayed(callSettings.saveButton);
      });
      it('should popup warning modal on save', () => {
        utils.click(callSettings.saveButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.voicemailDisableTitle);
        });
      });
      it('should save successfully', () => {
        utils.click(callSettings.voicemailWarningDisable).then(() => {
          notifications.assertSuccess();
        });
      });
    })
  });
});
