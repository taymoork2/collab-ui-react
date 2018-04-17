import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { AddHuntGroupPage } from '../../pages/addHuntGroup.page';
import { CallUserPage } from '../../pages/callUser.page';
import * as os from 'os';
import * as featureToggle from '../../../utils/featureToggle.utils';

const callFeatures = new CallFeaturesPage();
const addHuntGroup = new AddHuntGroupPage();
const addUser = new CallUserPage();
const now = Date.now();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */

describe('Huron Functional: adding-huntgroup', () => {
  const customer = huronCustomer({
    test: 'adding-huntgroup',
    users: { noOfUsers: 3, noOfDids: 0 },
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

    it('should navigate to Manage Users page', () => {
      utils.click(manageUsersPage.buttons.manageUsers);
    });

    it('should navigate to manually add user with "email" or "Names and email" when hit "Next"', () => {
      if (featureToggle.features.atlasF3745AutoAssignLicenses) {
        utils.click(manageUsersPage.actionCards.manualAddOrModifyUsers);
      } else {
        utils.expectIsDisplayed(manageUsersPage.select.radio.orgManual);
        utils.click(manageUsersPage.buttons.next);
      }
      if (featureToggle.features.atlasEmailSuppress) {
        utils.wait(manageUsersPage.emailSuppress.emailSuppressIcon);
        utils.click(manageUsersPage.buttons.next);
      }
      utils.expectIsDisplayed(manageUsersPage.manual.emailAddress.addUsersField, LONG_TIMEOUT);
      utils.expectIsDisplayed(manageUsersPage.manual.radio.emailAddress);
      utils.click(manageUsersPage.manual.radio.emailAddress);
    });

    it('should add user 1', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_adding-huntgroup_1_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should add user 2', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_adding-huntgroup_2_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should add user 3', () => {
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, `${os.userInfo().username}_adding-huntgroup_3_${now}@gmail.com`);
      utils.sendKeys(manageUsersPage.manual.emailAddress.addUsersField, protractor.Key.ENTER);
    });

    it('should navigate to Add Service for users phase', () => {
      utils.waitUntilEnabled(manageUsersPage.buttons.next).then(() => {
        utils.expectIsEnabled(manageUsersPage.buttons.next);
      });
      utils.click(manageUsersPage.buttons.next);
    });

    it('should select Cisco Spark Call', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.save);
      utils.waitForPresence(addUser.sparkCallRadio, 6000);
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

  describe('Step 1a: Provision name of Hunt Group', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
      utils.expectIsDisplayed(callFeatures.newFeatureButton);
    });

    it('should display buttons for huntgroup feature', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
      utils.expectIsDisplayed(callFeatures.hgFeatureButton);
    });

    it('should click on huntgroup button', () => {
      utils.click(callFeatures.hgFeatureButton);
      navigation.expectDriverCurrentUrl('huronHuntGroup');
      utils.expectIsDisplayed(addHuntGroup.createHGTtile);
    });

    it('should check title', () => {
      utils.expectIsDisplayed(addHuntGroup.createHGTtile);
    });

    it('should check closeBtn', () => {
      utils.expectIsDisplayed(addHuntGroup.closeBtn);
    });

    it('should check disabledBtn', () => {
      utils.expectIsDisplayed(addHuntGroup.disabledBtn);
    });

    it('should check next page btn', () => {
      utils.expectIsDisplayed(addHuntGroup.toNextPage);
    });

    it('should check description', () => {
      utils.expectIsDisplayed(addHuntGroup.description);
    });

    it('should input huntgroup name', () => {
      utils.sendKeys(addHuntGroup.hgName, 'new-hg');
      utils.expectIsDisplayed(addHuntGroup.enableBtn);
    });

    it('should press close button', () => {
      utils.click(addHuntGroup.closeBtn);
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check close dialog', () => {
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(addHuntGroup.closeModalTitle);
    });

    it('should check continue button', () => {
      utils.expectIsDisplayed(addHuntGroup.continueBtn);
    });

    it('should check cancel button', () => {
      utils.expectIsDisplayed(addHuntGroup.cancelBtn);
    });

    it('should click cancel hunt group creation', () => {
      utils.click(addHuntGroup.cancelBtn);
      navigation.expectDriverCurrentUrl('call-features');
    });

    describe('Step 1b: Re-provision name of Hunt Group', () => {
      it('should display buttons for huntgroup feature', () => {
        utils.click(callFeatures.newFeatureButton);
        utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
        utils.expectIsDisplayed(callFeatures.hgFeatureButton);
      });

      it('should click on huntgroup button', () => {
        utils.click(callFeatures.hgFeatureButton);
        navigation.expectDriverCurrentUrl('huronHuntGroup');
        utils.expectIsDisplayed(addHuntGroup.createHGTtile);
      });

      it('should check title', () => {
        utils.expectIsDisplayed(addHuntGroup.createHGTtile);
      });

      it('should check closeBtn', () => {
        utils.expectIsDisplayed(addHuntGroup.closeBtn);
      });

      it('should check disabledBtn', () => {
        utils.expectIsDisplayed(addHuntGroup.disabledBtn);
      });

      it('should check next page btn', () => {
        utils.expectIsDisplayed(addHuntGroup.toNextPage);
      });

      it('should check description', () => {
        utils.expectIsDisplayed(addHuntGroup.description);
      });

      it('should input huntgroup name', () => {
        utils.sendKeys(addHuntGroup.hgName, 'new-hg');
        utils.expectIsDisplayed(addHuntGroup.enableBtn);
      });

      it('should cancel creation', () => {
        utils.click(addHuntGroup.closeBtn);
        utils.expectIsDisplayed(addHuntGroup.closeDialog);
      });

      it('should click continue creation', () => {
        utils.click(addHuntGroup.continueBtn);
        navigation.expectDriverCurrentUrl('huronHuntGroup');
      });

      it('should click next page', () => {
        utils.click(addHuntGroup.enableBtn);
        utils.expectIsDisplayed(addHuntGroup.enableBtn);
      });
    });
  });

  describe('Step 2: Provision number of Hunt Group', () => {
    it('should display step 2 title', () => {
      utils.expectIsDisplayed(addHuntGroup.featureTitle);
    });

    it('should display feature description', () => {
      utils.expectIsDisplayed(addHuntGroup.featureDesc);
    });

    it('should display feature back arrow', () => {
      utils.expectIsDisplayed(addHuntGroup.featureBackArrow);
    });

    it('should display feature next arrow', () => {
      utils.expectIsDisplayed(addHuntGroup.disabledBtn);
    });

    it('should click back arrow', () => {
      utils.click(addHuntGroup.featureBackArrow);
    });

    it('should click next page', () => {
      utils.click(addHuntGroup.enableBtn);
      utils.expectIsDisplayed(addHuntGroup.featureTitle);
    });

    it('should input pilot number', () => {
      utils.sendKeys(addHuntGroup.inputNumber, '325');
      browser.driver.sleep(1000);
      utils.sendKeys(addHuntGroup.inputNumber, protractor.Key.ENTER);
    });

    it('should display the card', () => {
      utils.expectIsDisplayed(addHuntGroup.firstCard);
      utils.expectIsDisplayed(addHuntGroup.enableBtn);
    });

    it('should check first card right panel', () => {
      utils.expectIsDisplayed(addHuntGroup.rightPanel);
      utils.expectIsDisplayed(addHuntGroup.rightSide);
    });

    it('should check the left panel', () => {
      utils.expectIsDisplayed(addHuntGroup.leftPanel);
      utils.expectIsDisplayed(addHuntGroup.leftSide);
    });

    it('should input second pilot number', () => {
      utils.sendKeys(addHuntGroup.inputNumber, '326');
      browser.driver.sleep(1000);
      utils.sendKeys(addHuntGroup.inputNumber, protractor.Key.ENTER);
    });
    it('should displays both the cards', () => {
      utils.expectIsDisplayed(addHuntGroup.firstHG);
      utils.expectIsDisplayed(addHuntGroup.secondHG);
      utils.expectIsDisplayed(addHuntGroup.enableBtn);
    });

    it('should press close button', () => {
      utils.click(addHuntGroup.closeBtn);
    });

    it('should check close dialog', () => {
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(addHuntGroup.closeModalTitle);
    });

    it('should check continue button and next btn', () => {
      utils.expectIsDisplayed(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.enableBtn);
    });

    it('should display the longest idle option', () => {
      utils.expectIsDisplayed(addHuntGroup.longestIdle);
    });

    it('should display the broadcast option', () => {
      utils.expectIsDisplayed(addHuntGroup.broadcast);
    });

    it('should display the circular option', () => {
      utils.expectIsDisplayed(addHuntGroup.circular);
    });

    it('should display the top down option', () => {
      utils.expectIsDisplayed(addHuntGroup.topDown);
    });

    it('should press close button', () => {
      utils.click(addHuntGroup.closeBtn);
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check close dialog', () => {
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(addHuntGroup.closeModalTitle);
    });

    it('should check continue button and next btn', () => {
      utils.expectIsDisplayed(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.enableBtn);
    });

    it('should start selecting members', () => {
      utils.click(addHuntGroup.enableBtn);
      utils.sendKeys(addHuntGroup.inputMember, `${os.userInfo().username}`);
      browser.driver.sleep(1000);
      utils.sendKeys(addHuntGroup.inputNumber, protractor.Key.ENTER);
    });

    it('should check left panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberLeft);
    });

    it('should check middle panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberMiddle);
    });

    it('should check right panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberRight);
    });

    it('should press close button', () => {
      utils.click(addHuntGroup.closeBtn);
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(addHuntGroup.closeModalTitle);
    });

    it('should check continue button and next btn', () => {
      utils.expectIsDisplayed(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.enableBtn);
    });

    it('should check for fallback title', () => {
      utils.expectIsDisplayed(addHuntGroup.fallbackTitle);
    });

    it('should check for internal destination button', () => {
      utils.expectIsDisplayed(addHuntGroup.internalDest);
    });

    it('should check for external destination button', () => {
      utils.expectIsDisplayed(addHuntGroup.externalDest);
    });

    it('should enter internal destination', () => {
      utils.sendKeys(addHuntGroup.inputMember, `${os.userInfo().username}`);
      browser.driver.sleep(1000);
      utils.sendKeys(addHuntGroup.inputNumber, protractor.Key.ENTER);
    });

    it('should check left panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberLeft);
    });

    it('should check middle panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberMiddle);
    });

    it('should check right panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberRight);
    });

    it('should make sure create butn enabled', () => {
      utils.expectIsDisplayed(addHuntGroup.createEnabled);
    });

    it('should click back arrow and next arrow', () => {
      utils.click(addHuntGroup.featureBackArrow);
      utils.click(addHuntGroup.enableBtn);
    });

    it('should check left panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberLeft);
    });

    it('should check middle panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberMiddle);
    });

    it('should check right panel', () => {
      utils.expectIsDisplayed(addHuntGroup.memberRight);
    });

    it('should press close button', () => {
      utils.click(addHuntGroup.closeBtn);
      utils.expectIsDisplayed(addHuntGroup.closeDialog);
    });

    it('should check modal title', () => {
      utils.expectIsDisplayed(addHuntGroup.closeModalTitle);
    });

    it('should check continue button and next btn', () => {
      utils.expectIsDisplayed(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.continueBtn);
      utils.click(addHuntGroup.createEnabled);
    });

    it('it should be on features page', () => {
      navigation.expectDriverCurrentUrl('/services/call-features');
    });

    describe('Feature page details', () => {
      it('should show huntgroup card with details', () => {
        utils.expectIsDisplayed(addHuntGroup.article);
        utils.expectIsDisplayed(addHuntGroup.hgDetailHeader);
      });

      it('should display other details', () => {
        utils.expectIsDisplayed(addHuntGroup.hgPilot);
        utils.expectIsDisplayed(addHuntGroup.hgMembersCount);
      });

      it('should click close btn', () => {
        utils.waitForPresence(callFeatures.deleteFeature);
        utils.click(callFeatures.deleteFeature);
        utils.expectIsDisplayed(addHuntGroup.deleteHG);
        utils.expectIsDisplayed(addHuntGroup.cancelDeleteFeature);
        utils.expectIsDisplayed(addHuntGroup.deleteFeature);
      });
      it('should click cancel', () => {
        utils.click(addHuntGroup.cancelDeleteFeature);
        utils.waitForPresence(callFeatures.deleteFeature);
        utils.click(callFeatures.deleteFeature);
      });
      it('should click delete', () => {
        utils.click(addHuntGroup.deleteFeature);
      });
    });
  });
});
