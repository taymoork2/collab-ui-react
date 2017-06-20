import * as provisioner from '../../provisioner/provisioner';
import * as os from 'os';
import { AtlasTrial, TrialOffer, Offers } from '../../provisioner/atlas-trial';
import { CmiCustomer } from '../../provisioner/cmi-customer';
import { CmiSite } from '../../provisioner/cmi-site';
import { CmiNumberRange } from '../../provisioner/cmi-number-range';
import { CallSettingsPage } from '../pages/callSettings.page';

const callSettings = new CallSettingsPage();

/* global LONG_TIMEOUT */

describe('Huron Functional: call-settings', () => {
  const testPartner = 'huron-ui-test-partner';
  let customerName;

  beforeAll(done => {
    customerName = `${os.userInfo().username}_call-settings`;

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

  describe('Internal Dialing Section', () => {
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
  });

  // FYI: ensure this suite is the last to execute
  xdescribe('increase extension length', () => {
    it('should display a modal when extension length is increased', () => {
      utils.selectDropdown('extensionLength', '7');
      utils.waitForModal().then(() => {
        utils.expectIsDisplayed(callSettings.extensionLengthModalTitle);
      });
    });
  });
});
