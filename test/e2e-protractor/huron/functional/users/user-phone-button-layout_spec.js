import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallUserPage } from '../../pages/callUser.page';
import { CallUserPhoneButtonLayoutPage } from '../../pages/callUserPhoneButtonLayout.page';
import { CallUserPlacePage } from '../../pages/callUserPlace.page';

const CallUser = new CallUserPage();
const CallUserLine = new CallUserPlacePage();
const UserPhoneButtonLayout = new CallUserPhoneButtonLayoutPage();

/* globals, navigation, users, telephony */
describe('Huron Functional: user-phone-button-layout', () => {
  const customer = huronCustomer({
    test: 'user-phone-btn-layout',
    users: { noOfUsers: 1 },
  });
  const USERS = customer.users;

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

  it('Enter the user details on the search bar and Navigate to user details view', () => {
    utils.click(CallUser.usersList.searchFilter);
    utils.searchAndClick(USERS[0].email);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.expectIsDisplayed(users.communicationService);
  });
  it('should navigate to call details view', () => {
    utils.click(users.communicationService);
    utils.expectIsDisplayed(CallUser.callOverview.features.title);
    utils.expectIsDisplayed(CallUser.callOverview.features.singleNumberReach);
    utils.expectIsDisplayed(CallUser.callOverview.features.speedDials);
    utils.expectIsDisplayed(CallUser.callOverview.features.dialingRestrictions);
    utils.expectIsDisplayed(CallUser.callOverview.features.phoneButtonLayout);
    utils.expectIsDisplayed(CallUser.callOverview.addNewLine);
  });

  describe('Add Line Feature to User Phone Button Layout', () => {
    it('add another line to the phone button Layout', () => {
      utils.click(CallUser.callOverview.addNewLine);
      utils.expectIsDisplayed(CallUserLine.directoryNumber.title);
      utils.expectIsDisplayed(CallUserLine.saveButton);
      utils.expectIsEnabled(CallUserLine.saveButton);
      utils.click(CallUserLine.saveButton).then(() => {
        notifications.assertSuccess();
      });
    })
    it('should navigate to PhoneButton & Speed Dial details view', () => {
      utils.click(CallUser.callSubMenu);
      utils.click(CallUser.callOverview.features.phoneButtonLayout);
      utils.expectIsDisplayed(UserPhoneButtonLayout.title);
      utils.expectIsDisplayed(UserPhoneButtonLayout.actionMenu);
    });
    it('should not see the edit/delete for Line added', () => {
      utils.expectIsNotDisplayed(UserPhoneButtonLayout.firstLineEditButton);
      utils.expectIsNotDisplayed(UserPhoneButtonLayout.firstLineDeleteButton);
    });
  });
  describe('Phone Button Layout Action Menu', () => {
    beforeAll(() => {
      utils.click(UserPhoneButtonLayout.actionMenu);
    });
    it('should show Add Button menu item', () => {
      utils.expectIsDisplayed(UserPhoneButtonLayout.addButtonAction);
    });
    it('should show Reorder menu item', () => {
      utils.expectIsDisplayed(UserPhoneButtonLayout.reorderButtonAction);
    });

    describe('Add Phone Button Action', () => {
      beforeAll(() => {
        utils.click(UserPhoneButtonLayout.addButtonAction);
      });
      it('should show the phone button and speedDial title', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.title);
      });
      it('should show Cancel button', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.buttonCancelButton);
      });
      it('should show disabled Save button', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.buttonSaveButton);
        utils.expectIsDisabled(UserPhoneButtonLayout.buttonSaveButton);
      });
      it('should show "SpeedDial/FeatureNone" Dropdown with default "Speed Dial" field', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.newButtonDropDown);
      });
      it('should show "Contact Name" and "NumberFormat" fields', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.newSpeedDialContactName);
        utils.expectIsDisplayed(UserPhoneButtonLayout.newSpeedDialNumberFormat);
      });
      it('should take user back to Phone Button List', () => {
        utils.click(UserPhoneButtonLayout.buttonCancelButton);
        utils.expectIsNotDisplayed(UserPhoneButtonLayout.newSpeedDialContactName);
        utils.expectIsDisplayed(UserPhoneButtonLayout.actionMenu);
      });
    });

    describe('Add Speed Dial Phone Button action', () => {
      const SPEEDDIAL_DESTINATION_E164_NAME = 'David Perry External E164';
      const SPEEDDIAL_DESTINATION_E164_VALUE = '4695550001';
      const SPEEDDIAL_DESTINATION_URI_NAME = 'Freddy Bob URI Address';
      const SPEEDDIAL_DESTINATION_URI_VALUE = 'freddy.bob@uri.com';
      const SPEEDDIAL_DESTINATION_CUSTOM_NAME = 'Raee Carter Custom DN';
      const SPEEDDIAL_DESTINATION_CUSTOM_VALUE = '5002';
      const SPEEDDIAL_DESTINATION_TYPE_EXTERNAL = 'External';
      const SPEEDDIAL_DESTINATION_TYPE_URI = 'URI Address';
      const SPEEDDIAL_DESTINATION_TYPE_CUSTOM = 'Custom';
      beforeEach(() => {
        utils.click(UserPhoneButtonLayout.actionMenu);
        utils.click(UserPhoneButtonLayout.addButtonAction);
      });
      afterEach(() => {
        utils.expectIsNotDisplayed(UserPhoneButtonLayout.newSpeedDialContactName);
      });
      it('should be able to save a new external number speed dial', () => {
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_EXTERNAL);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_E164_NAME);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialDestinationInputPhone, SPEEDDIAL_DESTINATION_E164_VALUE);
        utils.click(UserPhoneButtonLayout.buttonSaveButton);
        utils.waitForText(UserPhoneButtonLayout.speedDialLabels, SPEEDDIAL_DESTINATION_E164_NAME);
      });
      it('should be able to save a new uri speed dial', () => {
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_URI);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_URI_NAME);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialDestinationInputUri, SPEEDDIAL_DESTINATION_URI_VALUE);
        utils.click(UserPhoneButtonLayout.buttonSaveButton);
        utils.waitForText(UserPhoneButtonLayout.speedDialLabels, SPEEDDIAL_DESTINATION_URI_NAME);
      });
      it('should be able to save a new internal number speed dial', () => {
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_CUSTOM);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_CUSTOM_NAME);
        utils.sendKeys(UserPhoneButtonLayout.newSpeedDialDestinationInputCustom, SPEEDDIAL_DESTINATION_CUSTOM_VALUE);
        utils.click(UserPhoneButtonLayout.buttonSaveButton);
        utils.waitForText(UserPhoneButtonLayout.speedDialLabels, SPEEDDIAL_DESTINATION_CUSTOM_NAME);
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstSpeedDialEntryLabel);
        utils.expectIsNotDisplayed(UserPhoneButtonLayout.phoneButtonEntryDraggableHandles);
      });
    });

    describe('Reorder Phone Button action', () => {
      beforeAll(() => {
        utils.click(UserPhoneButtonLayout.actionMenu);
        utils.expectIsDisplayed(UserPhoneButtonLayout.reorderButtonAction);
        utils.click(UserPhoneButtonLayout.reorderButtonAction);
      });
      afterAll(() => {
        utils.click(UserPhoneButtonLayout.buttonCancelButton);
      });
      it('should show the Phone Button & Speed Dial title', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.title);
      });
      it('should show Cancel button', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.buttonCancelButton);
      });
      it('should show Save button', () => {
        utils.expectIsDisplayed(UserPhoneButtonLayout.buttonSaveButton);
      });
      it('should show draggable handle', () => {
        utils.expectCountToBeGreater(UserPhoneButtonLayout.phoneButtonEntryDraggableHandles, 0);
      });
      it('should have two or more speed dials for this test', () => {
        utils.expectCountToBeGreater(UserPhoneButtonLayout.speedDialEntries, 1);
      });
    });

    describe('Delete Speed Dial Phone Button Action', () => {
      beforeAll(() => {
        utils.click(CallUser.callSubMenu);
        utils.click(CallUser.callOverview.features.phoneButtonLayout);
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstSpeedDialEntryLabel);
      });
      it('should see a list of speed dials phone buttons that can be deleted', () => {
        utils.expectCountToBeGreater(UserPhoneButtonLayout.speedDialEntries, 0);
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstSpeedDialEntryLabel);
        //delete button exists
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstSpeedDialDeleteButton);
        //edit button exists
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstSpeedDialEditButton);
      });
      it('should be able to remove an existing speed dial phone button', () => {
        UserPhoneButtonLayout.firstSpeedDialEntryLabel.getText().then((initialFirstSpeedDialName) => {
          utils.click(UserPhoneButtonLayout.firstSpeedDialDeleteButton);
          utils.expectIsDisplayed(UserPhoneButtonLayout.speedDialDeleteConfirmationButton);
          utils.click(UserPhoneButtonLayout.speedDialDeleteConfirmationButton);
          utils.expectNotText(UserPhoneButtonLayout.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
        });
      });
    });

    describe('Feature None Action Menu', () => {
      const DESTINATION_TYPE_EMPTY = 'Empty';
      const DESTINATION_LABEL = 'None';
      beforeAll(() => {
        utils.click(CallUser.callSubMenu);
        utils.click(CallUser.callOverview.features.phoneButtonLayout);
      });
      it('should be able add feature none ', () => {
        utils.click(UserPhoneButtonLayout.actionMenu);
        utils.click(UserPhoneButtonLayout.addButtonAction);
        utils.selectDropdown('.csSelect-container[name="buttonTypeSelect"]', DESTINATION_TYPE_EMPTY);
        utils.click(UserPhoneButtonLayout.buttonSaveButton);
        utils.waitForText(UserPhoneButtonLayout.speedDialLabels, DESTINATION_LABEL);
      });
      it('should see a list of feature none that can be deleted', () => {
        // should not see Edit button for Feature None
        utils.expectIsNotDisplayed(UserPhoneButtonLayout.firstEmptyEditButton);
        // should see Edit button for Feature None
        utils.expectIsDisplayed(UserPhoneButtonLayout.firstEmptyDeleteButton);
      });

      it('should be able to delete feature none ', () => {
        UserPhoneButtonLayout.firstFeatureNoneLabel.getText().then((initialFeatureNoneName) => {
          utils.click(UserPhoneButtonLayout.firstEmptyDeleteButton);
          utils.expectIsDisplayed(UserPhoneButtonLayout.speedDialDeleteConfirmationButton);
          utils.click(UserPhoneButtonLayout.speedDialDeleteConfirmationButton);
          utils.expectNotText(UserPhoneButtonLayout.firstFeatureNoneLabel, initialFeatureNoneName);
        });
      });
    });
  });
});
