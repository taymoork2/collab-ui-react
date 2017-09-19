import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();
/* global LONG_TIMEOUT */

describe('Huron Functional: call-settings', () => {
  const customer = huronCustomer({ test: 'call-settings' });

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

  describe('Regional Settings', () => {
    const newPreferredLanguage = 'English (United Kingdom)';
    const newTimeZone = 'Etc/GMT+12';
    const newDateFormat = 'DD-MM-YY';
    const newTimeFormat = '24 hour';

    it('click on preferred  language drop down', () => {
      utils.selectDropdown('.csSelect-container[name="preferredLanguage"]', newPreferredLanguage);
    });

    it('click on time zone drop down', () => {
      utils.selectDropdown('.csSelect-container[name="timeZone"]', newTimeZone);
    });

    it('make sure save button is displayed', () => {
      utils.expectIsDisplayed(callSettings.saveButton);
    });

    it('make sure cancel button is displayed', () => {
      utils.expectIsDisplayed(callSettings.cancelButton);
    });

    it('click on date format drop down', () => {
      utils.selectDropdown('.csSelect-container[name="dateFormatSelect"]', newDateFormat);
    });

    it('click on time format drop down', () => {
      utils.selectDropdown('.csSelect-container[name="timeFormatSelect"]', newTimeFormat);
    });

    it('click on save button', () => {
      utils.click(callSettings.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });

    it('saved time zone is displayed', () => {
      utils.expectText(callSettings.timeZone, newTimeZone);
    });

    it('saved date format is displayed', () => {
      utils.expectText(callSettings.dateFormat, newDateFormat);
    });

    it('saved time format is displayed', () => {
      utils.expectText(callSettings.timeFormat, newTimeFormat);
    });

    it('saved preferred language is displayed', () => {
      utils.expectText(callSettings.preferredLanguage, newPreferredLanguage);
    });
  });

  describe('Internal Dialing', () => {
    describe('set a routing prefix', () => {
      it('should show a routing prefix input when "Reserve a Prefix" radio is checked', () => {
        utils.click(callSettings.reservePrefixRadio);
        utils.expectIsDisplayed(callSettings.dialingPrefixInput, LONG_TIMEOUT);
      });

      it('should enable save button when valid entry is entered', () => {
        utils.expectIsDisabled(callSettings.saveButton);
        utils.sendKeys(callSettings.dialingPrefixInput, '8765');
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

    describe('add extension range', () => {
      it('should display extension range inputs when "Add Extension Range" link is clicked', () => {
        utils.click(callSettings.addExtensionRangeBtn);
        utils.expectIsDisplayed(callSettings.beginRange, LONG_TIMEOUT);
        utils.expectIsDisplayed(callSettings.endRange, LONG_TIMEOUT);
      });

      it('should enable save button when valid entries are entered', () => {
        utils.expectIsDisabled(callSettings.saveButton);
        utils.sendKeys(callSettings.beginRange, '400');
        utils.sendKeys(callSettings.endRange, '499');
        utils.waitUntilEnabled(callSettings.saveButton).then(() => {
          utils.expectIsEnabled(callSettings.saveButton);
        });
      });

      it('should save successfully', () => {
        utils.click(callSettings.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    // FYI: ensure this suite is the last to execute
    describe('increase extension length', () => {
      it('should display a warning dialog when extension length is increased', () => {
        utils.selectDropdown('.csSelect-container[name="extensionLength"]', '7');
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.extensionLengthWarningTitle);
        });
      });

      it('should display Choose Prefix modal when continue is clicked', () => {
        utils.click(callSettings.continueButton);
        utils.waitForModal().then(() => {
          utils.expectIsDisplayed(callSettings.extensionPrefixTitle);
          utils.expectIsDisplayed(callSettings.extensionPrefixInput);
        });
      });

      it('should enable save button when valid entries are entered', () => {
        utils.expectIsDisabled(callSettings.extensionPrefixSaveButton);
        utils.sendKeys(callSettings.extensionPrefixInput, '5678');
        utils.waitUntilEnabled(callSettings.extensionPrefixSaveButton).then(() => {
          utils.expectIsEnabled(callSettings.extensionPrefixSaveButton);
        });
      });

      it('should save successfully', () => {
        utils.click(callSettings.extensionPrefixSaveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });
  });

  describe('Dialing Restrictions', () => {
    it('national dialing should be disabled', () => {
      utils.expectIsDisplayed(callSettings.nationalDialing);
    });
    it('premium dialing should be disabled', () => {
      utils.expectIsDisplayed(callSettings.premiumDialing);
    });
    it('international dialing should be disabled', () => {
      utils.expectIsDisplayed(callSettings.internationalDialing);
    });
  });

  xdescribe('Voicemail', () => {
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

    xdescribe('Voicemail settings', () => {
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

    xdescribe('Turn off Voicemail settings', () => {
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
    });
  });
});
