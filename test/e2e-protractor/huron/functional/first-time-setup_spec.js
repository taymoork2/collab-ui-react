import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();

/* global LONG_TIMEOUT */

describe('Huron Functional: first-time-wizard', () => {
  const customerOptions = {
    test: 'first-time-full',
    pstn: 3,
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
  it('should have "Start your new 90-day trial" banner showing for call', () => {
    utils.expectIsDisplayed(wizard.planReviewCallTrial);
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

  describe('External Dialing', () => {
    describe('Outbound Dial Digit', () => {
      it('should show a warning when selecting a number for dialing out that matches first digit of internal prefix range', () => {
        utils.selectDropdown('.csSelect-container[name="steeringDigit"]', '3');
        utils.expectIsDisplayed(callSettings.dialWarning);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(wizard.beginBtn);
      });
      it('should cause warning to go away when selecting a number that does not match first digit of interal prefix range', () => {
        utils.selectDropdown('.csSelect-container[name="steeringDigit"]', '4');
        utils.expectIsNotDisplayed(callSettings.dialWarning);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(wizard.beginBtn);
      });
    });

    describe('Dialing Preferences', () => {
      it('should default to first option', () => {
        utils.expectIsDisplayed(wizard.dialOneRadio);
      });
      it('should default to requiring user to dial 1 before area code--checkbox is empty ', () => {
        utils.scrollIntoView(callSettings.dialOneChkBx);
        expect(utils.getCheckboxVal(callSettings.dialOneChkBx)).toBeFalsy();
      });
      it('should allow user to click box to not require user to dial 1 before area code', () => {
        utils.setCheckboxIfDisplayed(callSettings.dialOneChkBx, true, 1000);
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(wizard.beginBtn);
      });
      it('should not have a warning requiring PSTN to be set up', () => {
        utils.expectIsNotDisplayed(callSettings.pstnWarning);
      });
      it('should allow user to select simplified local dialing and input an area code', () => {
        utils.click(callSettings.simplifiedLocalRadio);
        utils.sendKeys(callSettings.areaCode, '919');
      });
      it('should enable save button', () => {
        utils.expectIsEnabled(wizard.beginBtn);
      });
    });
  });

  describe('Voicemail settings', () => {
    it('should default to not having External Voicemail Access', () => {
      utils.click(wizard.scrollToBottomButton);
      expect(utils.getCheckboxVal(wizard.companyVoicemailToggle)).toBeFalsy();
    });
    it('should enable voicemail toggle', () => {
      utils.scrollBottom('.modal');
      utils.setCheckboxIfDisplayed(wizard.companyVoicemailToggle, true, 1000);
    });
    it('should have two blank checkbox options', () => {
      utils.scrollIntoView(callSettings.voicemailToEmailCheckBox);
      expect(utils.getCheckboxVal(callSettings.externalVoicemailCheckBox)).toBeFalsy();
      expect(utils.getCheckboxVal(callSettings.voicemailToEmailCheckBox)).toBeFalsy();
    });
    it('should check External Voicemail Access box', () => {
      utils.setCheckboxIfDisplayed(callSettings.externalVoicemailCheckBox, true, 1000);
      utils.scrollBottom('.modal');
    });
    it('should display a dropdown to select a phone number for external voicemail access when activated', () => {
      utils.click(wizard.voicemailDropdown);
      utils.click(wizard.voicemailDropdownSelect);
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
      utils.scrollIntoView(wizard.voicemailEmailWithoutAttachment);
    });
    it('should default to Email notification with Attachment', () => {
      utils.click(wizard.voicemailEmailWithAttachment);
    });
    it('should click Email notification without attachment', () => {
      utils.click(wizard.voicemailEmailWithoutAttachment);
    });
    it('should enable save button', () => {
      utils.expectIsEnabled(wizard.beginBtn);
    });
  });

  describe('Finalize first time wizard setup', () => {
    const SUBDOMAIN = `ftwTestWizard${now}`;
    it('should click on get started button to progress to next screen', () => {
      utils.click(wizard.beginBtn);
    });
    it('should have a pop-up modal for successful save', () => {
      notifications.assertSuccess();
    });
    it('should set up a Webex domain', () => {
      utils.waitForPresence(wizard.checkAvailabilityBtn, 6000);
      utils.waitUntilEnabled(wizard.sipInput);
      let iter;
      for (iter = 0; iter < SUBDOMAIN.length; iter++) {
        utils.sendKeys(wizard.sipInput, SUBDOMAIN.charAt(iter));
      };
    });
    it('should check availability of domain', () => {
      utils.click(wizard.checkAvailabilityBtn);
      utils.expectIsDisplayed(wizard.checkAvailabilitySuccess);
    });
    it('should click Next button', () => {
      utils.waitUntilEnabled(wizard.beginBtn)
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
