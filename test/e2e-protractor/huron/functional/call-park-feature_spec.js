import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../pages/callFeatures.page';
import { CallParkFeaturePage } from '../pages/callParkFeature.page';
import { CallUserPage } from '../pages/callUser.page';
import * as os from 'os';
import { featureToggle } from '../../utils/featureToggle.utils';

const callFeatures = new CallFeaturesPage();
const callParkFeature = new CallParkFeaturePage();
const addUser = new CallUserPage();
const now = Date.now();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */

describe('Huron Functional: add-call-park', () => {
  const customer = huronCustomer({
    test: 'add-call-park',
    users: 3,
  });
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

  describe('Step 0: Add 3 users via UI and not proviosner for now', () => {
    it('should navigate to Users overview page', () => {
      utils.click(navigation.usersTab);
      navigation.expectDriverCurrentUrl('users');
    });

    it('should navigate to Manage Users page and "Manually add or modify users" radio button is selected', () => {
      utils.click(manageUsersPage.buttons.manageUsers);
      utils.waitForText(manageUsersPage.select.title, 'Add or Modify Users');
      utils.expectIsDisplayed(manageUsersPage.select.radio.orgManual);
    });

    it('should navigate to manually add user with "email" or "Names and email" when hit "Next"', () => {
      utils.click(manageUsersPage.buttons.next);
      if (featureToggle.features.atlasEmailSuppress) {
        utils.wait(manageUsersPage.emailSuppress.emailSuppressIcon);
        utils.click(manageUsersPage.buttons.next);
      }
      utils.expectIsDisplayed(manageUsersPage.manual.emailAddress.addUsersField, LONG_TIMEOUT);
      utils.expectIsDisplayed(manageUsersPage.manual.radio.emailAddress);
      utils.click(manageUsersPage.manual.radio.emailAddress);
    });

    it('should add user 1', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_add-callpark_1_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should add user 2', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_add-callpark_2_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should add user 3', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_add-callpark_3_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should navigate to Add Service for users phase', () => {
      utils.waitUntilEnabled(manageUsersPage.buttons.next).then(() => {
        utils.expectIsEnabled(manageUsersPage.buttons.next);
      });
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(addUser.sparkCallRadio);
    });

    it('should select Cisco Spark Call', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.save);
      utils.click(addUser.sparkCallRadio);
      utils.expectIsEnabled(manageUsersPage.buttons.next);
    });

    it('should click on next and navigate to Assign Numbers', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish, LONG_TIMEOUT);
      utils.waitForText(addUser.assignNumbers.title, 'Assign Numbers');
      utils.expectIsDisplayed(addUser.assignNumbers.subMenu);
    });

    it('should navigate to Add user success page when finish is clicked', () => {
      utils.click(manageUsersPage.buttons.finish);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish);
      utils.waitForText(addUser.successPage.newUserCount, '3 New user');
      utils.expectIsDisplayed(addUser.successPage.recordsProcessed);
    });
    it('should navigate to Users overview page', () => {
      utils.click(manageUsersPage.buttons.finish);
      navigation.expectDriverCurrentUrl('users');
      utils.expectIsDisplayed(navigation.tabs);
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
      utils.sendKeys(callParkFeature.cpName, 'new-cp');
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
        utils.sendKeys(callParkFeature.cpName, 'new-cp');
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
      utils.sendKeys(callParkFeature.startNumber, '310');
      browser.driver.sleep(1000);
      utils.sendKeys(callParkFeature.startNumber, protractor.Key.ENTER);
    });

    it('should click the next arrow', () => {
      utils.click(callParkFeature.enableBtn);
    });
  });

  describe('Step 3: Add members to the call park', () => {
    it('should start selecting members', () => {
      utils.sendKeys(callParkFeature.inputMember, `${os.userInfo().username}`);
      browser.driver.sleep(1000);
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

  describe('Step 4: Edit Call Park', () => {
    it('should show call park card with details', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      utils.expectIsDisplayed(callParkFeature.cpDetailHeader);
    });

    it('should click to edit details', () => {
      utils.click(callParkFeature.article);
    });

    it('it should be on the call park edit page', () => {
      navigation.expectDriverCurrentUrl('/features/cp/edit');
    });

    it('it should verify previous settings', () => {
      utils.expectIsDisplayed(callParkFeature.editName);
      expect(callParkFeature.editName.getAttribute('value')).toEqual('new-cp');
      expect(callParkFeature.editStartRange.getAttribute('value')).toEqual('310');
      expect(callParkFeature.editEndRange.getAttribute('value')).toEqual('319');
      expect(callParkFeature.editRevTime.getAttribute('value')).toEqual('120');
      expect(callParkFeature.editMemberCard.getText()).toEqual(`${os.userInfo().username}_add-callpark_1_${now}@gmail.com`)
    });

    it('should leave edit', () => {
      utils.click(callParkFeature.editBackBtn);
    });
  });

  describe('Step 5: Delete Call Park', () => {
    it('should show call park card with details', () => {
      utils.expectIsDisplayed(callParkFeature.article);
      utils.expectIsDisplayed(callParkFeature.cpDetailHeader);
    });

    it('should check details', () => {
      utils.expectIsDisplayed(callParkFeature.cpPilot);
      utils.expectIsDisplayed(callParkFeature.cpMembersCount);
    });

    it('should click delete button', () => {
      utils.click(callParkFeature.btnClose);
      utils.expectIsDisplayed(callParkFeature.deleteCP);
      utils.expectIsDisplayed(callParkFeature.cancelDeleteFeature);
      utils.expectIsDisplayed(callParkFeature.deleteFeature);
    });

    it('should confirm delete', () => {
      utils.click(callParkFeature.deleteFeature);
    });
  });
});
