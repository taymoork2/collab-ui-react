import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallUserPage } from '../../pages/callUser.page';
import { CallUserPlacePage } from '../../pages/callUserPlace.page';
import { CallSettingsPage } from '../../pages/callSettings.page';
import * as os from 'os';
import * as featureToggle from '../../../utils/featureToggle.utils';

const callUserPage = new CallUserPage();
const now = Date.now();
const callUserPlacePage = new CallUserPlacePage();
const callSettingsPage = new CallSettingsPage();

/* globals LONG_TIMEOUT, manageUsersPage, navigation, users, telephony */
describe('Huron Functional: user-line-settings', () => {
  const customer = huronCustomer({ test: 'user-line-settings' });
  const USER_EMAIL = `huron.ui.test.partner+${customer.name}_${now}@gmail.com`;
  const USER_FIRST_NAME = 'Darth';
  const USER_LAST_NAME = 'Vader';
  const DESTINATION_E164 = '4695550000';
  const DESTINATION_URI = 'callforward@uri.com';
  const DESTINATION_CUSTOM = '890';
  const DESTINATION_TYPE_EXTERNAL = 'External';
  const DESTINATION_TYPE_URI = 'URI Address';
  const CUSTOM = 'Custom';
  const BLOCKED = 'Blocked Outbound Caller ID';
  const USER2_EMAIL = `${os.userInfo().username}user_line_settings_${now}@gmail.com`;
  const USER2_FIRST_NAME = 'Rain';
  const USER2_LAST_NAME = 'Jader';

  /* ---------------------------------------------------------------
     Similar Line Configuration test cases are also in Places.
     Good to keep both in sync if changes are being made here.
     Places do not support voicemail.
  ----------------------------------------------------------------*/
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

  it('should enable voicemail for customer', () => {
    utils.click(navigation.callSettings);
    navigation.expectDriverCurrentUrl('call-settings');
    utils.click(callSettingsPage.voicemailSwitch);
    utils.expectSwitchState(callSettingsPage.voicemailSwitch, true);
    utils.click(callSettingsPage.saveButton);
    utils.waitForModal().then(() => {
      notifications.assertSuccess();
      utils.expectIsDisplayed(callSettingsPage.voicemailWarningModalTitle);
    });
    utils.click(callSettingsPage.voicemailModalDoneButton);
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
      if (featureToggle.features.atlasEmailSuppress) {
        utils.wait(manageUsersPage.emailSuppress.emailSuppressIcon);
        utils.click(manageUsersPage.buttons.next);
      }
      utils.expectIsDisplayed(manageUsersPage.manual.emailAddress.addUsersField, LONG_TIMEOUT);
      utils.expectIsDisplayed(manageUsersPage.manual.radio.emailAddress);
      utils.click(manageUsersPage.manual.radio.emailAddress);
    });
    it('Should contain valid input fields on selecting names and email', () => {
      utils.click(manageUsersPage.manual.radio.nameAndEmail);
      utils.expectIsDisplayed(manageUsersPage.manual.namesAndEmail.firstName);
    });
    it('should enable add icon when valid entries are entered', () => {
      utils.expectIsDisplayed(callUserPage.inactivePlusIcon);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.firstName, USER_FIRST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.lastName, USER_LAST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.emailAddress, USER_EMAIL);
      utils.expectIsDisplayed(manageUsersPage.manual.namesAndEmail.plusIcon);
      utils.click(manageUsersPage.manual.namesAndEmail.plusIcon);
    });
    it('should enable add icon when valid entries are entered', () => {
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.firstName, USER2_FIRST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.lastName, USER2_LAST_NAME);
      utils.sendKeys(manageUsersPage.manual.namesAndEmail.emailAddress, USER2_EMAIL);
      utils.expectIsDisplayed(manageUsersPage.manual.namesAndEmail.plusIcon);
    });
    it('should enable next button on adding valid user information', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.next);
      utils.click(manageUsersPage.manual.namesAndEmail.plusIcon);
      utils.waitUntilEnabled(manageUsersPage.buttons.next).then(() => {
        utils.expectIsEnabled(manageUsersPage.buttons.next);
      });
    });
    it('should navigate to Add Service for users phase', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(callUserPage.sparkCallRadio);
    });
    it('should select Cisco Spark Call', () => {
      utils.expectIsEnabled(manageUsersPage.buttons.save);
      utils.click(callUserPage.sparkCallRadio);
      utils.expectIsEnabled(manageUsersPage.buttons.next);
    });
    it('should click on next and navigate to Assign Numbers', () => {
      utils.click(manageUsersPage.buttons.next);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish, LONG_TIMEOUT);
      utils.waitForText(callUserPage.assignNumbers.title, 'Assign Numbers');
      utils.expectIsDisplayed(callUserPage.assignNumbers.subMenu);
    });
    it('should navigate to Add user success page when finish is clicked', () => {
      utils.click(manageUsersPage.buttons.finish);
      utils.expectIsDisplayed(manageUsersPage.buttons.finish);
      utils.waitForText(callUserPage.successPage.newUserCount, '2 New users');
      utils.expectIsDisplayed(callUserPage.successPage.recordsProcessed);
    });
    it('should navigate to Users overview page', () => {
      utils.click(manageUsersPage.buttons.finish);
      navigation.expectDriverCurrentUrl('users');
      utils.expectIsDisplayed(navigation.tabs);
    });
  });

  it('Enter the user details on the search bar and Navigate to user details view', () => {
    utils.click(callUserPage.usersList.searchFilter);
    utils.sendKeys(callUserPage.usersList.searchFilter, USER_EMAIL + protractor.Key.ENTER);
    utils.click(callUserPage.usersList.userFirstName);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.expectIsDisplayed(users.communicationsService);
  });
  it('should navigate to call details view', () => {
    utils.click(users.communicationsService);
    utils.expectIsDisplayed(callUserPage.callOverview.features.title);
    utils.expectIsDisplayed(callUserPage.callOverview.features.singleNumberReach);
  });

  describe('Line Settings', () => {
    it('should navigate to Line Settings details view', () => {
      utils.click(callUserPage.callOverview.directoryNumbers.number);
      utils.expectIsDisplayed(callUserPage.lineConfiguration.title);
    });

    describe('Directory Numbers', () => {
      it('should display the Directory Numbers section', () => {
        utils.expectIsDisplayed(callUserPlacePage.directoryNumber.title);
      });
      it('should display the extension', () => {
        utils.expectIsDisplayed(callUserPlacePage.directoryNumber.extension);
      });
      it('should display the Phone Number', () => {
        utils.expectIsDisplayed(callUserPlacePage.directoryNumber.phoneNumber);
      });
      //Add Directory Number
      it('should select the extension to be added', () => {
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '305');
      });
      it('should be able to add the Directory number', () => {
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should not show save button', () => {
        utils.expectIsNotDisplayed(callUserPlacePage.saveButton);
      });
      //Edit Directory Number
      it('should be able to edit the extension and save', () => {
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '315');
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Call Forwarding', () => {
      it('should display the Call Forwarding section', () => {
        utils.expectIsDisplayed(callUserPlacePage.callForwarding.title);
      });
      it('should display Option Call Forward None', () => {
        utils.expectIsDisplayed(callUserPlacePage.callForwarding.radioNone);
      });
      it('should display Option Call Forward All', () => {
        utils.expectIsDisplayed(callUserPlacePage.callForwarding.radioAll);
      });
      it('should display Option Call Forward Busy or Away', () => {
        utils.expectIsDisplayed(callUserPlacePage.callForwarding.radioBusyOrAway);
      });
    });

    describe('Call Forwarding All', () => {
      //Forward All
      it('should be able to add Call Forward All Custom Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioAll);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', CUSTOM);
        utils.sendKeys(callUserPlacePage.callForwarding.destinationInputCustom, DESTINATION_CUSTOM);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward All External Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioAll);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_EXTERNAL);
        utils.sendKeys(callUserPlacePage.callForwarding.destinationInputPhone, DESTINATION_E164);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward All Destination URI Address', () => {
        utils.click(callUserPlacePage.callForwarding.radioAll);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_URI);
        utils.clear(callUserPlacePage.callForwarding.destinationInputUri);
        utils.sendKeys(callUserPlacePage.callForwarding.destinationInputUri, DESTINATION_URI);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to set Call Forward All to voicemail', () => {
        utils.click(callUserPlacePage.callForwarding.radioAll);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardAllVoicemail, true, 100);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Call Forwarding Forward Busy or Away', () => {
      //Forward Busy No Answer with same interna/external destinations
      it('should select Option Call Forward Busy or Away', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
      });

      it('should be able to reset Call Forward Busy or Away to voicemail', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.click(callUserPlacePage.callForwarding.forwardInternalVoicemail);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardInternalVoicemail, false, 100);
      });
      it('should be able to add Call Forward Busy or Away Custom Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', CUSTOM);
        utils.sendKeys(callUserPlacePage.callForwarding.busyInternalInputCustom, DESTINATION_CUSTOM);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward Busy or Away External Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_EXTERNAL);
        utils.sendKeys(callUserPlacePage.callForwarding.busyinternalInputPhone, DESTINATION_E164);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward Busy or Away Destination URI Address', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_URI);
        utils.clear(callUserPlacePage.callForwarding.busyInternalInputUri);
        utils.sendKeys(callUserPlacePage.callForwarding.busyInternalInputUri, DESTINATION_URI);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to set Call Forward Busy or Away to voicemail', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardInternalVoicemail, true, 100);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });

      //Forward Busy No Answer External call destinations  Differently
      it('should be able to select call forward Busy or Away with different External destination', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardBusyExternal, true, 100);
      });
      it('should be able to set Call Forward Busy or Away with different External to voicemail', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardExternalVoicemail, false, 100);
      });
      it('should be able to add Call Forward Busy or Away with different External Custom Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', CUSTOM);
        utils.sendKeys(callUserPlacePage.callForwarding.busyExternalInputCustom, DESTINATION_CUSTOM);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward Busy or Away with different External Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_EXTERNAL);
        utils.sendKeys(callUserPlacePage.callForwarding.busyExternalInputPhone, DESTINATION_E164);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward Busy or Away with different External URI Address', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_URI);
        utils.clear(callUserPlacePage.callForwarding.busyExternalInputUri);
        utils.sendKeys(callUserPlacePage.callForwarding.busyExternalInputUri, DESTINATION_URI);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to set Call Forward Busy or Away with different External to voicemail', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.click(callUserPlacePage.callForwarding.forwardExternalVoicemail);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardExternalVoicemail, true, 100);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Simultaneous Calls', () => {
      it('should display the Simultaneous Calls section', () => {
        utils.expectIsDisplayed(callUserPlacePage.simultaneousCalling.title);
      });
      it('should be able to select the option for 8 Simultaneous Calls ', () => {
        utils.click(callUserPlacePage.simultaneousCalling.radio8);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to select the option for 2 Simultaneous Calls ', () => {
        utils.click(callUserPlacePage.simultaneousCalling.radio2);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Caller ID', () => {
      it('should display the Caller ID section', () => {
        utils.expectIsDisplayed(callUserPlacePage.callerId.title);
      });
      it('should be able to set custom Caller ID', () => {
        utils.selectDropdown('.csSelect-container[name="callerIdSelection"]', CUSTOM);
        utils.sendKeys(callUserPlacePage.callerId.customName, USER_FIRST_NAME);
        utils.sendKeys(callUserPlacePage.callerId.customNumber, DESTINATION_E164);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to Block custom Caller ID', () => {
        utils.selectDropdown('.csSelect-container[name="callerIdSelection"]', BLOCKED);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Auto Answer', () => {
      it('should display the Auto Answer section', () => {
        utils.expectIsDisplayed(callUserPlacePage.autoAnswer.title);
      });
    });

    describe('Shared Line', () => {
      it('should display the Shared Line section', () => {
        utils.expectIsDisplayed(callUserPlacePage.sharedLine.title);
      });
    });

    it('should navigate back to call details view', () => {
      utils.click(callUserPage.callSubMenu);
      utils.expectIsDisplayed(callUserPage.callOverview.directoryNumbers.title);
      utils.expectIsDisplayed(callUserPage.callOverview.features.title);
    });
  });

  describe('Add a new line', () => {
    it('should display add a new line link', () => {
      utils.expectIsDisplayed(callUserPage.callOverview.addNewLine);
    });

    it('should be on add line page', () => {
      utils.click(callUserPage.callOverview.addNewLine);
    });

    it('should display Directory Numbers section', () => {
      utils.expectIsDisplayed(callUserPlacePage.directoryNumber.title);
    });

    it('should display Call Forwarding section', () => {
      utils.expectIsDisplayed(callUserPlacePage.callForwarding.title);
    });

    it('should display Simultaneous Calls section', () => {
      utils.expectIsDisplayed(callUserPlacePage.simultaneousCalling.title);
    });

    it('should display Caller ID section', () => {
      utils.expectIsDisplayed(callUserPlacePage.callerId.title);
    });

    it('should display Auto Answer section', () => {
      utils.expectIsDisplayed(callUserPlacePage.autoAnswer.title);
    });

    it('should display Shared Line section', () => {
      utils.expectIsDisplayed(callUserPlacePage.sharedLine.title);
    });

    it('should display save button and clickable', () => {
      utils.expectIsDisplayed(callUserPlacePage.saveButton);
      utils.expectIsEnabled(callUserPlacePage.saveButton);
    });

    it('should create a new line and display success', () => {
      utils.click(callUserPlacePage.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });
  });
});
