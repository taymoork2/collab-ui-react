import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';
import { AddUserPage } from '../pages/addUser.page';

const AddUser = new AddUserPage();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */

describe('Huron Functional: add-user', () => {
  const customer = huronCustomer('add-user');
  const USER_EMAIL = 'huron.ui.test.blue.user+captainphasma@gmail.com';
  const USER_FIRST_NAME = 'Captain';
  const USER_LAST_NAME = 'Phasma';

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

  it('should navigate to Manage Users page and "Manualy add or modify users" radio button is selected', () => {
    utils.click(manageUsersPage.buttons.manageUsers);
    utils.waitForText(manageUsersPage.select.title, 'Add or Modify Users');
    utils.expectIsDisplayed(manageUsersPage.select.radio.orgManual);
  });
  describe('Add user flow', () => {
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
      utils.expectIsDisplayed(AddUser.inactivePlusIcon);
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
      utils.expectIsDisplayed(AddUser.sparkCallRadio);
    });
    it('should select Cisco Spark Call', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.save);
      utils.click(AddUser.sparkCallRadio);
      utils.expectIsEnabled(manageUsersPage.buttons.next);
    });
    it('should click on next and navigate to Assign Numbers', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish, LONG_TIMEOUT);
      utils.waitForText(AddUser.assignNumbers.title, 'Assign Numbers');
      utils.expectIsDisplayed(AddUser.assignNumbers.subMenu);
    });
    it('should navigate to Add user sucess page when finish is clicked', () => {
      utils.click(manageUsersPage.buttons.finish);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish);
      utils.waitForText(AddUser.successPage.newUserCount, '1 New user');
      utils.expectIsDisplayed(AddUser.successPage.recordsProcessed);
    });
    it('should navigate to Users overview page', () => {
      utils.click(manageUsersPage.buttons.finish);
      navigation.expectDriverCurrentUrl('users');
      utils.expectIsDisplayed(navigation.tabs);
    });
  });
  describe('User validation flow', () => {
    it('Enter the user details on the search bar and Navigate to user details view', () => {
      utils.click(AddUser.usersList.searchFilter);
      utils.sendKeys(AddUser.usersList.searchFilter, USER_EMAIL + protractor.Key.ENTER);
      utils.click(AddUser.usersList.userFirstName);
      utils.expectIsDisplayed(users.servicesPanel);
      utils.expectIsDisplayed(users.communicationsService);
    });
    it('should navigate to call details view ', () => {
      utils.click(users.communicationsService);
      utils.expectIsDisplayed(AddUser.callOverview.directoryNumbers.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.title);
      utils.expectIsDisplayed(AddUser.callOverview.directoryNumbers.number);
      utils.expectIsDisplayed(AddUser.callOverview.features.singleNumberReach);
      utils.expectIsDisplayed(AddUser.callOverview.features.speedDials);
      utils.expectIsDisplayed(AddUser.callOverview.features.dialingRestrictions);
    });
    it('should navigate to line configuration details view', () => {
      utils.click(AddUser.callOverview.directoryNumbers.number);
      utils.expectIsDisplayed(AddUser.lineConfiguration.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.directoryNumbers.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.callForwarding.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.simultaneousCalling.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.callerId.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.autoAnswer.title);
      utils.expectIsDisplayed(AddUser.lineConfiguration.sharedLine.title);
    });
    it('should navigate back to call details view', () => {
      utils.click(AddUser.callSubMenu);
      utils.expectIsDisplayed(AddUser.callOverview.directoryNumbers.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.singleNumberReach);
    });
    it('should navigate to Single Number Reach details view', () => {
      utils.click(AddUser.callOverview.features.singleNumberReach);
      utils.expectIsDisplayed(telephony.snrTitle);
      utils.expectIsDisplayed(telephony.snrSwitch);
    });
    it('should navigate back to call details view', () => {
      utils.click(AddUser.callSubMenu);
      utils.expectIsDisplayed(AddUser.callOverview.directoryNumbers.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.speedDials);
    });
    it('should navigate to Speed Dials details view', () => {
      utils.click(AddUser.callOverview.features.speedDials);
      utils.expectIsDisplayed(AddUser.speedDial.title);
    });
    it('should navigate back to call details view', () => {
      utils.click(AddUser.callSubMenu);
      utils.expectIsDisplayed(AddUser.callOverview.directoryNumbers.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.title);
      utils.expectIsDisplayed(AddUser.callOverview.features.dialingRestrictions);
    });
    it('should navigate to Dialing Restrictions details view', () => {
      utils.click(AddUser.callOverview.features.dialingRestrictions);
      utils.expectIsDisplayed(AddUser.dialingRestrictions.nationaDialing.title);
      utils.expectIsDisplayed(AddUser.dialingRestrictions.premiumDialing.title);
      utils.expectIsDisplayed(AddUser.dialingRestrictions.internationalDialing.title);
      utils.click(users.closeSidePanel);
    });
  });
});
