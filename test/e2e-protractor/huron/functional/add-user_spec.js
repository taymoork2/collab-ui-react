import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';
import { AddUserPage } from '../pages/addUser.page';
import { CallSpeedDialsPage } from '../pages/callSpeedDials.page';

const AddUser = new AddUserPage();
const SpeedDialsPage = new CallSpeedDialsPage();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */

describe('Huron Functional: add-user', () => {
  const customer = huronCustomer('add-user');
  const USER_EMAIL = `huron.ui.test.partner+${customer.name}_captainphasma@gmail.com`;
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
  it('should navigate to Manage Users page and "Manually add or modify users" radio button is selected', () => {
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
    it('should navigate to Add user success page when finish is clicked', () => {
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
    it('should navigate to call details view', () => {
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
      utils.expectIsDisplayed(SpeedDialsPage.title);
      utils.expectIsDisplayed(SpeedDialsPage.actionMenu);
    });

    describe('Speed Dials action menu', () => {
      beforeAll(function () {
        utils.click(AddUser.callSubMenu);
        utils.click(AddUser.callOverview.features.speedDials);
        utils.click(SpeedDialsPage.actionMenu);
      });
      it('should show Add Speed Dial menu item', () => {
        utils.expectIsDisplayed(SpeedDialsPage.addSpeedDialAction);
        utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
      });
      it('should show Reorder menu item', () => {
        utils.expectIsDisplayed(SpeedDialsPage.addSpeedDialAction);
        utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
      });

      describe('Add Speed Dial section', () => {
        beforeAll(function () {
          utils.click(SpeedDialsPage.addSpeedDialAction);
        });
        it('should show the Speed Dials title', () => {
          utils.expectIsDisplayed(SpeedDialsPage.title);
        });
        it('should show Cancel button', () => {
          utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
        });
        it('should show disabled Save button', () => {
          utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
          utils.expectIsDisabled(SpeedDialsPage.speedDialSaveButton);
        });
        it('should show Contact Name fields', () => {
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
        });
        it('should show Destination fields', () => {
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationLabel);
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
        });

        describe('Cancel Button', () => {
          it('should take user back to Speed Dial list', () => {
            utils.click(SpeedDialsPage.speedDialCancelButton);
            utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
            utils.expectIsDisplayed(SpeedDialsPage.actionMenu);
          });
        });
      });

      describe('Add new Speed Dial action', () => {
        const SPEEDDIAL_DESTINATION_E164_NAME = 'Ann Anderson External E164';
        const SPEEDDIAL_DESTINATION_E164_VALUE = '4695550000';
        const SPEEDDIAL_DESTINATION_URI_NAME = 'Billy Bob URI Address';
        const SPEEDDIAL_DESTINATION_URI_VALUE = 'billy.bob@uri.com';
        const SPEEDDIAL_DESTINATION_CUSTOM_NAME = 'Curtis Carter Custom DN';
        const SPEEDDIAL_DESTINATION_CUSTOM_VALUE = '5001';
        const SPEEDDIAL_DESTINATION_TYPE_EXTERNAL = 'External';
        const SPEEDDIAL_DESTINATION_TYPE_URI = 'URI Address';
        const SPEEDDIAL_DESTINATION_TYPE_CUSTOM = 'Custom';
        beforeEach(function () {
          utils.click(AddUser.callSubMenu);
          utils.click(AddUser.callOverview.features.speedDials);
          utils.click(SpeedDialsPage.actionMenu);
          utils.click(SpeedDialsPage.addSpeedDialAction);
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
          utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
        });
        afterEach(function () {
          utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
        });
        it('should be able to save a new external number speed dial', () => {
          utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_EXTERNAL);
          utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_E164_NAME);
          utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputPhone, SPEEDDIAL_DESTINATION_E164_VALUE);
          utils.click(SpeedDialsPage.speedDialSaveButton);
          utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_E164_NAME)
        });
        it('should be able to save a new uri speed dial', () => {
          utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_URI);
          utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_URI_NAME);
          utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputUri, SPEEDDIAL_DESTINATION_URI_VALUE);
          utils.click(SpeedDialsPage.speedDialSaveButton);
          utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_URI_NAME)
        });
        it('should be able to save a new internal number speed dial', () => {
          utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_CUSTOM);
          utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_CUSTOM_NAME);
          utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputCustom, SPEEDDIAL_DESTINATION_CUSTOM_VALUE);
          utils.click(SpeedDialsPage.speedDialSaveButton);
          utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_CUSTOM_NAME)
        });
      });

      describe('Reorder Speed Dial action', () => {
        beforeAll(function () {
          utils.click(AddUser.callSubMenu);
          utils.click(AddUser.callOverview.features.speedDials);
          utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
          utils.click(SpeedDialsPage.actionMenu);
          utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
          utils.click(SpeedDialsPage.reorderSpeedDialAction);
        });
        it('should show the Speed Dials title', () => {
          utils.expectIsDisplayed(SpeedDialsPage.title);
        });
        it('should show Cancel button', () => {
          utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
        });
        it('should show Save button', () => {
          utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
        });
        it('should show draggable handle', () => {
          utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntryDraggableHandles, 0);
        });

        describe('Draggable Handle', () => {
          it('should have two or more speed dials for this test', () => {
            utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 1);
          });
          // Unable to get Drag and Drop to work at this time.
          xit('should be able to move speed dial entry', () => {
            SpeedDialsPage.firstSpeedDialEntryLabel.getText().then(function (initialFirstSpeedDialName) {
              utils.dragAndDrop(SpeedDialsPage.speedDialEntries.first(), SpeedDialsPage.speedDialEntries.last());
              utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
            });
          });
        });
        it('should be able to save reordered speed dials', () => {
          utils.click(SpeedDialsPage.speedDialSaveButton);
        });
        it('saving should take you back to the speed dials list', () => {
          utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
          utils.expectIsNotDisplayed(SpeedDialsPage.speedDialEntryDraggableHandles);
        });
      });

      describe('Delete speed dials', () => {
        beforeAll(function () {
          utils.click(AddUser.callSubMenu);
          utils.click(AddUser.callOverview.features.speedDials);
          utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel); // expect at least one existing speed dial entry
        });
        it('should see a list of speed dials that can be deleted', () => {
          utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 0);
          utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
          utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialDeleteButton);
        });
        it('should be able to remove an existing speed dial', () => {
          SpeedDialsPage.firstSpeedDialEntryLabel.getText().then(function (initialFirstSpeedDialName) {
            utils.click(SpeedDialsPage.firstSpeedDialDeleteButton);
            utils.expectIsDisplayed(SpeedDialsPage.speedDialDeleteConfirmationButton);
            utils.click(SpeedDialsPage.speedDialDeleteConfirmationButton);
            utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
          });
        });
      });
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
