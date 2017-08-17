import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallUserPage } from '../../pages/callUser.page';

const CallUser = new CallUserPage();
const now = Date.now();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */
describe('Huron Functional: user-features', () => {
  const customer = huronCustomer('user-line-settings');
  const USER_EMAIL = `huron.ui.test.partner+${customer.name}_${now}@gmail.com`;
  const USER_FIRST_NAME = 'Darth';
  const USER_LAST_NAME = 'Vader';

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
  it('should navigate to Users overview page', () => {
    utils.click(navigation.usersTab);
    navigation.expectDriverCurrentUrl('users');
  });

  describe('Add user flow', () => {
    it('should navigate to Manage Users page and "Manually add or modify users" radio button is selected', () => {
      utils.click(manageUsersPage.buttons.manageUsers);
      utils.waitForText(manageUsersPage.select.title, 'Add or Modify Users');
      utils.expectIsDisplayed(manageUsersPage.select.radio.orgManual);
    });
    it('should navigate to manually add user with "email" or "Names and email" when hit "Next"', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(manageUsersPage.manual.emailAddress.addUsersField, LONG_TIMEOUT);
      utils.expectIsDisplayed(manageUsersPage.manual.radio.emailAddress);
    });
    it('Should contain valid input fields on selecting names and email', () => {
      utils.click(manageUsersPage.manual.radio.nameAndEmail);
      utils.expectIsDisplayed(manageUsersPage.manual.namesAndEmail.firstName);
    });
    it('should enable add icon when valid entries are entered', () => {
      utils.expectIsDisplayed(CallUser.inactivePlusIcon);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.firstName, USER_FIRST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.lastName, USER_LAST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.emailAddress, USER_EMAIL);
      utils.expectIsDisplayed(manageUsersPage.manual.namesAndEmail.plusIcon);
    });
    it('should enable next button on adding valid user information', () => {
      utils.expectIsDisabled(manageUsersPage.buttons.next);
      utils.click(manageUsersPage.manual.namesAndEmail.plusIcon);
      utils.waitUntilEnabled(manageUsersPage.buttons.next).then(() => {
        utils.expectIsEnabled(manageUsersPage.buttons.next);
      });
    });
    it('should navigate to Add Service for users phase', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(CallUser.sparkCallRadio);
    });
    it('should select Cisco Spark Call', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.save);
      utils.click(CallUser.sparkCallRadio);
      utils.expectIsEnabled(manageUsersPage.buttons.next);
    });
    it('should click on next and navigate to Assign Numbers', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish, LONG_TIMEOUT);
      utils.waitForText(CallUser.assignNumbers.title, 'Assign Numbers');
      utils.expectIsDisplayed(CallUser.assignNumbers.subMenu);
    });
    it('should navigate to Add user success page when finish is clicked', () => {
      utils.click(manageUsersPage.buttons.finish);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish);
      utils.waitForText(CallUser.successPage.newUserCount, '1 New user');
      utils.expectIsDisplayed(CallUser.successPage.recordsProcessed);
    });
    it('should navigate to Users overview page', () => {
      utils.click(manageUsersPage.buttons.finish);
      navigation.expectDriverCurrentUrl('users');
      utils.expectIsDisplayed(navigation.tabs);
    });
  });

  it('Enter the user details on the search bar and Navigate to user details view', () => {
    utils.click(CallUser.usersList.searchFilter);
    utils.sendKeys(CallUser.usersList.searchFilter, USER_EMAIL + protractor.Key.ENTER);
    utils.click(CallUser.usersList.userFirstName);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.expectIsDisplayed(users.communicationsService);
  });
  it('should navigate to call details view', () => {
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(CallUser.callOverview.features.title);
    utils.expectIsDisplayed(CallUser.callOverview.features.singleNumberReach);
    utils.expectIsDisplayed(CallUser.callOverview.features.speedDials);
    utils.expectIsDisplayed(CallUser.callOverview.features.dialingRestrictions);
  });


  describe('Line Settings', () => {
    it('should navigate to Line Settings details view', () => {
      utils.click(CallUser.callOverview.directoryNumbers.number);
      utils.expectIsDisplayed(CallUser.lineConfiguration.title);
    });
    describe('Directory Numbers', () => {
      it('should display the Directory Numbers section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.directoryNumbers.title);
      });
    });
    describe('Call Forwarding', () => {
      it('should display the Call Forwarding section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.callForwarding.title);
      });
    });
    describe('Simultanious Calls', () => {
      it('should display the Simultanious Calls section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.simultaneousCalling.title);
      });
    });
    describe('Caller ID', () => {
      it('should display the Caller ID section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.callerId.title);
      });
    });
    describe('Auto Answer', () => {
      it('should display the Auto Answer section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.autoAnswer.title);
      });
    });
    describe('Shared Line', () => {
      it('should display the Shared Line section', () => {
        utils.expectIsDisplayed(CallUser.lineConfiguration.sharedLine.title);
      });
    });
  });
});
