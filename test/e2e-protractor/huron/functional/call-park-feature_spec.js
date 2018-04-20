import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../pages/callFeatures.page';
import { CallParkFeaturePage } from '../pages/callParkFeature.page';

const callFeatures = new CallFeaturesPage();
const callParkFeature = new CallParkFeaturePage();

/* globals navigation */

describe('Huron Functional: call-park-feature', () => {
  const customer = huronCustomer({
    test: 'call-park-feature',
    users: { noOfUsers: 3 },
    doCallPark: true,
  });

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  const callParkStartNumber = (parseInt(customer.callOptions.numberRange.beginNumber) + 50).toString();
  const callParkEndNumber = (parseInt(customer.callOptions.numberRange.beginNumber) + 59).toString();
  const callParkSingleNumber = (parseInt(customer.callOptions.numberRange.beginNumber) + 60).toString();
  const newCallParkName = 'new-cp';

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });

  describe('Step 0: Edit call park', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
      utils.expectIsDisplayed(callFeatures.newFeatureButton);
    });

    it('should already be a call park created from the provisioner', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      expect(callParkFeature.cpDetailHeader.getText()).toContain(`${customer.name}_test_callpark`);
    });

    it('should click to edit details', () => {
      utils.click(callParkFeature.article);
    });

    it('should be on the call park edit page', () => {
      navigation.expectDriverCurrentUrl('/features/cp/edit');
      utils.expectIsDisplayed(callParkFeature.editName);
    });

    it('should display call park name', () => {
      expect(callParkFeature.editName.getAttribute('value')).toEqual(`${customer.name}_test_callpark`);
    });

    it('should be able to edit call park name and cancel', () => {
      utils.clear(callParkFeature.editName);
      utils.sendKeys(callParkFeature.editName, `${customer.name}_test_callparkedit`);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    it('should be able to edit call park range and cancel', () => {
      utils.clear(callParkFeature.editStartRange);
      utils.expectIsDisplayed(callParkFeature.numberDropdown);
      utils.sendKeys(callParkFeature.editStartRange, protractor.Key.ENTER);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    it('should be able to input single call park number and cancel', () => {
      utils.sendKeys(callParkFeature.singleNumber, callParkSingleNumber);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    describe('Edit call park reversion rule for Another destination (internal)', () => {
      it('should be able to click Another destination', () => {
        utils.click(callParkFeature.anotherDestination);
      });

      it('should see cancel button enabled and save button disabled', () => {
        utils.expectIsEnabled(callParkFeature.editCancel);
        utils.expectIsDisabled(callParkFeature.editSave);
      });

      it('should be able to set the internal fallback destination', () => {
        utils.sendKeys(callParkFeature.fallbackDestination, callParkStartNumber);
        utils.expectIsDisplayed(callParkFeature.fallbackDestinationDropdown);
        utils.sendKeys(callParkFeature.fallbackDestination, protractor.Key.ENTER);
      });

      it('should see save button enabled and able to cancel', () => {
        utils.expectIsEnabled(callParkFeature.editSave);
        utils.click(callParkFeature.editCancel);
      });
    });

    describe('Edit call park reversion rule for Another destination (external)', () => {
      it('should be able to click Another destination', () => {
        utils.click(callParkFeature.anotherDestination);
      });

      it('should see cancel button enabled and save button disabled', () => {
        utils.expectIsEnabled(callParkFeature.editCancel);
        utils.expectIsDisabled(callParkFeature.editSave);
      });

      it('should be able to set the external number format', () => {
        utils.expectIsDisplayed(callParkFeature.fallbackDestinationFormat);
        utils.click(callParkFeature.fallbackDestinationFormat);
        utils.expectIsDisplayed(callParkFeature.fallbackDestinationExternal);
        utils.click(callParkFeature.fallbackDestinationExternal);
      });

      it('should be able to input the external number', () => {
        utils.expectIsDisplayed(callParkFeature.fallbackDestinationExternalNumber);
        utils.sendKeys(callParkFeature.fallbackDestinationExternalNumber, '8472342345');
      });

      it('should see save button enabled and able to cancel', () => {
        utils.expectIsEnabled(callParkFeature.editSave);
        utils.click(callParkFeature.editCancel);
      });
    });

    it('should be able to set edit reversion timer and cancel', () => {
      utils.expectIsDisplayed(callParkFeature.editRevTime);
      utils.click(callParkFeature.editRevTime);
      utils.expectIsDisplayed(callParkFeature.reversionTimerSelect);
      utils.click(callParkFeature.reversionTimerSelect);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    it('should be able to add a member and cancel', () => {
      utils.expectIsDisplayed(callParkFeature.memberAdd);
      utils.sendKeys(callParkFeature.memberAdd, customer.users[customer.users.length - 1].name.givenName);
      utils.expectIsDisplayed(callParkFeature.memberDropdown);
      utils.click(callParkFeature.memberDropdown);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    it('should be able to remove a member and cancel', () => {
      utils.expectIsDisplayed(callParkFeature.firstMemberCardRemove);
      utils.click(callParkFeature.firstMemberCardRemove);
      utils.expectIsEnabled(callParkFeature.editCancel);
      utils.expectIsEnabled(callParkFeature.editSave);
      utils.click(callParkFeature.editCancel);
    });

    describe('Edit multiple call park fields and save', () => {
      it('should be able to edit call park name', () => {
        utils.clear(callParkFeature.editName);
        utils.sendKeys(callParkFeature.editName, `${customer.name}_test_callparkedit`);
      });

      it('should be able to edit call park range and cancel', () => {
        utils.clear(callParkFeature.editStartRange);
        utils.expectIsDisplayed(callParkFeature.numberDropdown);
        utils.sendKeys(callParkFeature.editStartRange, protractor.Key.ENTER);
      });

      it('should be able to set the internal fallback destination', () => {
        utils.click(callParkFeature.anotherDestination);
        utils.sendKeys(callParkFeature.fallbackDestination, callParkStartNumber);
        utils.expectIsDisplayed(callParkFeature.fallbackDestinationDropdown);
        utils.sendKeys(callParkFeature.fallbackDestination, protractor.Key.ENTER);
      });

      it('should be able to add a member', () => {
        utils.sendKeys(callParkFeature.memberAdd, customer.users[customer.users.length - 1].name.givenName);
        utils.expectIsDisplayed(callParkFeature.memberDropdown);
        utils.click(callParkFeature.memberDropdown);
      });

      it('should be able to save and see success notification', () => {
        utils.expectIsEnabled(callParkFeature.editSave);
        utils.click(callParkFeature.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    it('should leave edit', () => {
      utils.click(callParkFeature.editBackBtn);
    });

    it('should show call park card with details', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      expect(callParkFeature.cpDetailHeader.getText()).toContain(`${customer.name}_test_callparkedit`);
    });

    it('should click delete button and confirm delete', () => {
      utils.click(callParkFeature.btnClose);
      utils.expectIsDisplayed(callParkFeature.deleteFeature);
      utils.click(callParkFeature.deleteFeature).then(() => {
        notifications.assertSuccess();
      });
    });
  });

  describe('Step 1a: Provision name of Call Park', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
      utils.expectIsDisplayed(callFeatures.newFeatureButton);
    });

    it('should display buttons for call park feature', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
      utils.expectIsDisplayed(callFeatures.cpFeatureButton);
    });

    it('should click on call park button', () => {
      utils.click(callFeatures.cpFeatureButton);
      navigation.expectDriverCurrentUrl('huronCallPark');
      utils.expectIsDisplayed(callParkFeature.createCPTitle);
    });

    it('should check title', () => {
      utils.expectIsDisplayed(callParkFeature.createCPTitle);
    });

    it('should check close button', () => {
      utils.expectIsDisplayed(callParkFeature.closeBtn);
    });

    it('should check disable button', () => {
      utils.expectIsDisplayed(callParkFeature.disabledBtn);
    });

    it('should check next page button', () => {
      utils.expectIsDisplayed(callParkFeature.toNextPage);
    });

    it('should check description', () => {
      utils.expectIsDisplayed(callParkFeature.description);
    });

    it('should input call park name', () => {
      utils.sendKeys(callParkFeature.cpName, newCallParkName);
      utils.expectIsDisplayed(callParkFeature.enableBtn);
    });

    it('should click delete button', () => {
      utils.click(callParkFeature.closeBtn);
      utils.expectIsDisplayed(callParkFeature.closeDialog);
    });

    it('should check close dialog', () => {
      utils.expectIsDisplayed(callParkFeature.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(callParkFeature.closeModalTitle);
    });

    it('should check continue button', () => {
      utils.expectIsDisplayed(callParkFeature.continueBtn);
    });

    it('should check cancel button', () => {
      utils.expectIsDisplayed(callParkFeature.cancelBtn);
    });

    it('should cancel call park creation', () => {
      utils.click(callParkFeature.cancelBtn);
      navigation.expectDriverCurrentUrl('call-features');
    });

    describe('Step 1b: Re-provision name of Call Park', () => {
      it('should display buttons for call park feature', () => {
        utils.click(callFeatures.newFeatureButton);
        utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
        utils.expectIsDisplayed(callFeatures.cpFeatureButton);
      });

      it('should click on call park button', () => {
        utils.click(callFeatures.cpFeatureButton);
        navigation.expectDriverCurrentUrl('huronCallPark');
        utils.expectIsDisplayed(callParkFeature.createCPTitle);
      });

      it('should check close button', () => {
        utils.expectIsDisplayed(callParkFeature.closeBtn);
      });

      it('should check disable button', () => {
        utils.expectIsDisplayed(callParkFeature.disabledBtn);
      });

      it('should check next page button', () => {
        utils.expectIsDisplayed(callParkFeature.toNextPage);
      });

      it('should check description', () => {
        utils.expectIsDisplayed(callParkFeature.description);
      });

      it('should input call park name', () => {
        utils.sendKeys(callParkFeature.cpName, newCallParkName);
        utils.expectIsDisplayed(callParkFeature.enableBtn);
      });

      it('should cancel creation', () => {
        utils.click(callParkFeature.closeBtn);
        utils.expectIsDisplayed(callParkFeature.closeDialog);
      });

      it('should click continue creation', () => {
        utils.click(callParkFeature.continueBtn);
        navigation.expectDriverCurrentUrl('huronCallPark');
      });

      it('should click next page', () => {
        utils.click(callParkFeature.enableBtn);
        utils.expectIsDisplayed(callParkFeature.enableBtn);
      });
    });
  });

  describe('Step 2: Provision numbers for Call Park', () => {
    it('should display step 2 title', () => {
      utils.expectIsDisplayed(callParkFeature.featureTitle);
    });

    it('should display feature description', () => {
      utils.expectIsDisplayed(callParkFeature.featureDesc);
    });

    it('should display feature back arrow', () => {
      utils.expectIsDisplayed(callParkFeature.featureBackArrow);
    });

    it('should display feature next arrow', () => {
      utils.expectIsDisplayed(callParkFeature.disabledBtn);
    });

    it('should click back arrow', () => {
      utils.click(callParkFeature.featureBackArrow);
    });

    it('should click next arrow', () => {
      utils.click(callParkFeature.enableBtn);
      utils.expectIsDisplayed(callParkFeature.featureTitle);
    });

    it('should input starting number and fill ending number', () => {
      utils.click(callParkFeature.startNumber);
      utils.sendKeys(callParkFeature.startNumber, callParkStartNumber);
      utils.expectIsDisplayed(callParkFeature.numberDropdown);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.DOWN);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.DOWN);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.DOWN);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.DOWN);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.ENTER);
    });

    it('should click the next arrow', () => {
      utils.expectIsEnabled(callParkFeature.enableBtn);
      utils.click(callParkFeature.enableBtn);
    });
  });

  describe('Step 3: Add members to the call park', () => {
    it('should start selecting members', () => {
      utils.sendKeys(callParkFeature.inputMember, customer.users[0].name.givenName);
      utils.expectIsDisplayed(callParkFeature.memberDropdown);
      utils.sendKeys(callParkFeature.inputMember, protractor.Key.ENTER);
    });

    it('should check left panel', () => {
      utils.expectIsDisplayed(callParkFeature.memberLeft);
    });

    it('should check middle panel', () => {
      utils.expectIsDisplayed(callParkFeature.memberMiddle);
    });

    it('should check right panel', () => {
      utils.expectIsDisplayed(callParkFeature.memberRight);
    });

    it('should expect create button to be displayed', () => {
      utils.expectIsDisplayed(callParkFeature.createEnabled);
    });

    it('should click back arrow and next arrow', () => {
      utils.click(callParkFeature.featureBackArrow);
      utils.click(callParkFeature.enableBtn);
    });

    it('should click create button', () => {
      utils.click(callParkFeature.createEnabled);
    });

    it('it should be on features page', () => {
      navigation.expectDriverCurrentUrl('/services/call-features');
    });
  });

  describe('Step 4: Check newly created call park', () => {
    it('should show call park card with details', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      expect(callParkFeature.cpDetailHeader.getText()).toContain(newCallParkName);
    });

    it('should click to edit details', () => {
      utils.click(callParkFeature.article);
    });

    it('it should be on the call park edit page', () => {
      navigation.expectDriverCurrentUrl('/features/cp/edit');
    });

    it('it should verify previous settings', () => {
      utils.expectIsDisplayed(callParkFeature.editName);
      expect(callParkFeature.editName.getAttribute('value')).toEqual(newCallParkName);
      expect(callParkFeature.editStartRange.getAttribute('value')).toEqual(callParkStartNumber);
      expect(callParkFeature.editEndRange.getAttribute('value')).toEqual(callParkEndNumber);
      expect(callParkFeature.editRevTime.getAttribute('value')).toEqual('120');
      expect(callParkFeature.editMemberCard.getText()).toContain(customer.users[0].name.givenName)
    });

    it('should leave edit', () => {
      utils.click(callParkFeature.editBackBtn);
    });
  });

  describe('Step 5: Delete Call Park', () => {
    it('should show call park card with details', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      expect(callParkFeature.cpDetailHeader.getText()).toContain(newCallParkName);
    });

    it('should check details', () => {
      utils.expectIsDisplayed(callParkFeature.cpPilot);
      utils.expectIsDisplayed(callParkFeature.cpMembersCount);
    });

    it('should click delete button', () => {
      utils.waitForPresence(callFeatures.deleteFeature);
      utils.click(callFeatures.deleteFeature);
      utils.expectIsDisplayed(callParkFeature.deleteCP);
      utils.expectIsDisplayed(callParkFeature.cancelDeleteFeature);
      utils.expectIsDisplayed(callParkFeature.deleteFeature);
    });

    it('should confirm delete', () => {
      utils.click(callParkFeature.deleteFeature).then(() => {
        notifications.assertSuccess();
      });
    });
  });
});
