import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { HuntGroupEdit } from '../../pages/huntGroupEdit.page';

const callFeatures = new CallFeaturesPage();
const huntGroupEdit = new HuntGroupEdit();

describe('Huron Functional: edit hunt group', () => {
  const customer = huronCustomer({
    test: 'edit-hunt-group',
    users: { noOfUsers: 4, noOfDids: 0 },
    doHuntGroup: true,
    pstn: 5,
  });

  const PSTN = customer.callOptions.pstn;

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  const EDIT_URL = '/features/hg/edit';
  const EDIT_NAME = 'Mos Eisley';
  const EDIT_EXTENSION = '326';

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });

  describe('Check for configured features', () => {
    describe('Hunt Group Settings', () => {
      it('should navigate to call features page', () => {
        navigation.clickServicesTab();
        utils.click(callFeatures.callFeatures);
      });
      it('should be on call features page', () => {
        navigation.expectDriverCurrentUrl('call-features')
      });
      it('should have an existing hunt group', () => {
        utils.expectIsDisplayed(callFeatures.card);
      });
      it('should click existing group to edit', () => {
        utils.click(callFeatures.card);
      });
      it('should land on Hunt Group Settings page', () => {
        navigation.expectDriverCurrentUrl(EDIT_URL);
      });
      it('should edit the existing hunt group name', () => {
        utils.clear(callFeatures.editGroupName);
        utils.sendKeys(callFeatures.editGroupName, EDIT_NAME);
      })
      it('should be able to add Hunt Group Numbers', () => {
        utils.sendKeys(huntGroupEdit.huntGroupNumInput, EDIT_EXTENSION);
        utils.waitForPresence(huntGroupEdit.extDropdown)
        utils.click(huntGroupEdit.extDropdown);
      });
      it('should remove the recently added group number', () => {
        utils.click(huntGroupEdit.removeExtCard);
      });
      it('should save current progress', () => {
        utils.click(callFeatures.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Call Settings', () => {
      it('should change member`s max ring time', () => {
        utils.click(huntGroupEdit.maxRingSecDropdown);
        utils.click(huntGroupEdit.maxRingSecSelect);
      });
      it('should change caller max wait time', () => {
        utils.click(huntGroupEdit.maxRingMinDropdown);
        utils.click(huntGroupEdit.maxRingMinSelect);
      });
      it('should save current progress', () => {
        utils.click(callFeatures.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Fallback Destination:', () => {
      describe('Alternate Fallback Destination', () => {
        it('should select Alternate Fallback Destination', () => {
          utils.click(huntGroupEdit.alternateFallbackRadio);
        });
        it('should add an alternate extension', () => {
          utils.sendKeys(huntGroupEdit.alternateFallbackInput, '311');
          utils.waitForPresence(huntGroupEdit.altExtDropdown);
          utils.click(huntGroupEdit.altExtDropdown);
        });
        it('should remove new extension', () => {
          utils.click(huntGroupEdit.removeExtCard3);
        });
        it('should select external number format', () => {
          utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', 'External');
        });
        it('should input an external number', () => {
          utils.sendKeys(huntGroupEdit.alternateFallbackDid, PSTN[0]);
        });
        it('should disable Hunt Group calls to Spark app', () => {
          utils.setCheckboxIfDisplayed(huntGroupEdit.hgSendToApp, false);
        });
        it('should click Longest Idle from hunting methods', () => {
          utils.click(huntGroupEdit.selectLongestIdle);
        })
        it('should save current changes', () => {
          utils.click(callFeatures.editSave).then(() => {
            notifications.assertSuccess();
          });
        });
      });

      describe('Automatic', () => {
        it('should select Automatic Fallback Destination Rule', () => {
          utils.click(huntGroupEdit.automaticFallbackRadio);
        });
        it('should select Broadcast from hunting methods', () => {
          utils.click(huntGroupEdit.selectBroadcast);
        });
        it('should save all changes', () => {
          utils.click(callFeatures.editSave).then(() => {
            notifications.assertSuccess();
          });
        });
      })
    });
  });
});
