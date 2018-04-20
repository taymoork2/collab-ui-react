import * as provisioner from '../../provisioner/provisioner';
import { CustomerSetupPage } from '../pages/customerSetup.page';
import * as os from 'os';
import { CallSettingsPage } from '../pages/callSettings.page';
import { CallUserPage } from '../pages/callUser.page';
import { AddPlacesPage } from '../pages/addPlaces.page';
import * as featureToggle from '../../utils/featureToggle.utils';

const addPlaces = new AddPlacesPage();
const AddUser = new CallUserPage();
const callSettings = new CallSettingsPage();
const customerSetup = new CustomerSetupPage();
const now = Date.now();

/* globals partner, navigation, utils, LONG_TIMEOUT, wizard,manageUsersPage*/

describe('Huron Functional: e2e-customer-setup', () => {
  const testPartner = 'huron-ui-test-partner';
  const CUSTOMER_NAME = `${os.userInfo().username}_e2e-customer-setup`;
  const CUSTOMER_EMAIL = `huron.ui.test.partner+${CUSTOMER_NAME}@gmail.com`;
  const USER_EMAIL = `huron.ui.test.partner+${CUSTOMER_NAME}_darthvader_${now}@gmail.com`;
  const USER_FIRST_NAME = 'Darth';
  const USER_LAST_NAME = 'Vader';
  var partnerWindow;

  beforeAll(done => {
    provisioner.tearDownAtlasCustomer(testPartner, CUSTOMER_NAME);
    provisioner.loginPartner(testPartner)
      .then(done);
  });
  afterAll(done => {
    provisioner.tearDownAtlasCustomer(testPartner, CUSTOMER_NAME).then(done);
  });

  it('should navigate to the customers overview page', () => {
    partnerWindow = browser.getWindowHandle();
    utils.expectIsDisplayed(partner.customerList);
    navigation.expectDriverCurrentUrl('customers');
  });
  it('should navigate to start trial view', () => {
    utils.click(partner.addButton);
    utils.expectIsDisplayed(customerSetup.customerInformation.title);
    utils.expectIsDisplayed(customerSetup.trialServices.title);
    utils.expectIsDisplayed(customerSetup.licensesQuantity.title);
    utils.expectIsDisplayed(customerSetup.trialDuration.title);
    utils.expectIsDisplayed(customerSetup.regionalSettings.title);
    utils.expectIsDisplayed(customerSetup.nonTrialServices.title);
  });

  describe('Create customer flow', () => {
    it('should enter company information', () => {
      utils.sendKeys(partner.customerNameInput, CUSTOMER_NAME);
      utils.sendKeys(partner.customerEmailInput, CUSTOMER_EMAIL);
      utils.click(partner.validLocationCheckbox);
      utils.click(partner.messageTrialCheckbox);
      utils.click(customerSetup.trialServices.checkbox.meetingTrial);
      utils.click(partner.webexTrialCheckbox);
      utils.click(partner.careTrialCheckbox);
      utils.click(partner.roomSystemsTrialCheckbox);
      utils.selectDropdown('.csSelect-container[name="\'defaultCountry\'"]', 'United States');
    });
    it('should validate entered information', () => {
      utils.expectInputCheckbox(customerSetup.trialServices.checkbox.call, true);
      utils.expectInputCheckbox(partner.validLocationCheckbox, true);
      utils.expectInputCheckbox(partner.messageTrialCheckbox, false);
      utils.expectInputCheckbox(customerSetup.trialServices.checkbox.meetingTrial, false);
      utils.expectInputCheckbox(partner.webexTrialCheckbox, false);
      utils.expectInputCheckbox(partner.careTrialCheckbox, false);
      utils.expectInputCheckbox(partner.roomSystemsTrialCheckbox, false);
    });
    it('should navigate to the trial setup - call view', () => {
      utils.click(partner.startTrialButton);
      utils.expectIsDisplayed(customerSetup.pstnProvider);
      utils.expectIsDisplayed(customerSetup.pstnContactInformation.title);
      utils.expectIsDisplayed(customerSetup.phoneNumbers.title);
    });
    it('should skip the pstn setup', () => {
      utils.click(customerSetup.skipButton);
      utils.expectIsDisplayed(customerSetup.trialFinish.title);
      utils.expectIsDisplayed(customerSetup.trialFinish.description);
    });
    it('should launch customer service wizard setup portal', () => {
      utils.click(customerSetup.launchCustomerPortalButton);
      utils.switchToNewWindow().then(() => {
        utils.wait(wizard.wizard, LONG_TIMEOUT);
        utils.waitIsDisplayed(wizard.leftNav);
        utils.waitIsDisplayed(wizard.mainView);
        utils.waitForText(wizard.mainviewTitle, 'Plan Review');
        utils.expectIsDisplayed(customerSetup.wizPlanReview.call.colHeader);
      });
    });
  });

  describe('Setup customer wizard Flow', () => {
    it('should Navigate to call settings page of setup wizard', () => {
      utils.click(wizard.beginBtn);
      utils.waitForText(wizard.mainviewTitle, 'Call Settings');
      utils.expectIsEnabled(customerSetup.wizCallSetting.companyVoiceMail.toggle);
    });
    it('should Navigate to message settings page of setup wizard', () => {
      utils.click(wizard.saveBtn);
      utils.waitForText(wizard.mainviewTitle, 'Message Settings');
    });
    it('should Navigate to enterprise settings page of setup wizard', () => {
      utils.click(wizard.saveBtn);
      utils.waitForText(wizard.mainviewTitle, 'Enterprise Settings');
      utils.sendKeys(customerSetup.wizEnterpriseSetting.subDomainInput, 'hurone2etests');
      utils.click(customerSetup.wizEnterpriseSetting.checkAvailabilityBtn);
    });
    it('should Navigate to finish setup wizard', () => {
      utils.click(wizard.saveBtn);
      utils.waitForText(wizard.mainviewTitle, 'Get Started');
      utils.waitForText(customerSetup.wizFinish.message, 'You\'re ready to go!');
    });
    it('should Navigate to customer overview page', () => {
      utils.click(wizard.finishBtn);
      navigation.expectDriverCurrentUrl('overview');
      utils.expectIsDisplayed(navigation.tabs);
    });
  });

  describe('Validate customer setup flow', () => {
    it('should navigate to customer services page', () => {
      utils.click(navigation.servicesTab);
      navigation.expectDriverCurrentUrl('services');
      utils.waitForText(customerSetup.services.title, 'Services');
      utils.expectIsDisplayed(customerSetup.services.serviceList);
      utils.expectIsDisplayed(customerSetup.services.call.callSettingsLink);
    });
    it('should navigate to customer call settings page', () => {
      utils.click(customerSetup.services.call.callSettingsLink);
      navigation.expectDriverCurrentUrl('services/call-settings');
      utils.waitForText(customerSetup.services.title, 'Call');
      utils.expectIsDisplayed(callSettings.regionalSettingsTitle);
      utils.expectIsDisplayed(callSettings.internalDialingTitle);
      utils.expectIsDisplayed(callSettings.externalDialingTitle);
      utils.expectIsDisplayed(callSettings.dialingRestrictionsTitle);
      utils.expectIsDisplayed(callSettings.companyCallerIdTitle);
      utils.expectIsDisplayed(callSettings.companyVoicemailTitle);
    });
    it('should navigate to customer users grid page', () => {
      utils.click(navigation.usersTab);
      navigation.expectDriverCurrentUrl('users');
      utils.expectIsDisplayed(element.all(by.cssContainingText('.ui-grid-cell', CUSTOMER_EMAIL)).first());
    });
  });

  describe('Add user flow', () => {
    describe('Create user flow', () => {
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

  describe('Add places flow', () => {
    it('should navigate to places page', () => {
      utils.click(addPlaces.placesTab);
      navigation.expectDriverCurrentUrl('places');
    });

    describe('create a new place', () => {
      it('should show an option to add new place', () => {
        utils.click(addPlaces.addNewPlace);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and allow to save', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Naboo');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a device', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectHuron);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '504');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn3);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
    });

    describe('Verify setup', () => {
      it('should list newly added place by search', () =>{
        utils.click(addPlaces.closeGrp);
        utils.click(addPlaces.searchPlaces);
        utils.sendKeys(addPlaces.searchBar, 'Naboo');
      });
      it('should click on newly added place and bring up side menu', () => {
        utils.click(addPlaces.clickLocation);
      });

      describe('Side Panel Options', () => {
        it('should land on overview page', () => {
          utils.expectIsDisplayed(addPlaces.overviewPg);
        });
        it('should have Service section', () =>{
          utils.expectIsDisplayed(addPlaces.servicesSctn);
        });
        it('should have Devices section', () => {
          utils.expectIsDisplayed(addPlaces.devicesSctn);
        });
        it('should select Call under services and navigate to the next page', () => {
          utils.click(addPlaces.callClick);
        });
        it('should land on Call Settings page', () => {
          utils.expectIsDisplayed(addPlaces.callStngsPg);
        });
        it('should have Preferred Language section with dropdown', () => {
          utils.expectIsDisplayed(addPlaces.prfrdLang);
          utils.expectIsDisplayed(addPlaces.prfrdLangDd);
        });
        it('should have Directory Numbers section', () => {
          utils.expectIsDisplayed(addPlaces.dirNumSct);
        });
        it('should have a Features section', () => {
          utils.expectIsDisplayed(addPlaces.featuresSct);
        });
        it('should click on Primary Directory Number', () => {
          utils.click(addPlaces.primaryClick);
        });
        it('should land on Line Configuration page', () => {
          utils.expectIsDisplayed(addPlaces.LineConfigPg);
        });
        it('should have Directory Numbers section', () => {
          utils.expectIsDisplayed(addPlaces.dirNumSct);
        });
        it('should have Call Forwarding section', () => {
          utils.expectIsDisplayed(addPlaces.callFwdSct);
        });
        it('should have Simultaneous Calls section', () => {
          utils.expectIsDisplayed(addPlaces.simulCallSct);
        });
        it('should have Caller ID section', () => {
          utils.expectIsDisplayed(addPlaces.callerIdSct);
        });
        it('should have Auto Answer section', () => {
          utils.expectIsDisplayed(addPlaces.autoAnsSct);
        });
        it('should have Shared Line section', () => {
          utils.expectIsDisplayed(addPlaces.sharedLineSct);
        });
        it('should exit side navigation and return to main Places page', () => {
          utils.click(addPlaces.sideNavClose);
          utils.expectIsDisplayed(addPlaces.overviewPg);
        });
      });
    });
  });

  describe('delete customer flow', () => {
    it('should close customer browser window', () => {
      browser.close();
      browser.switchTo().window(partnerWindow);
    });
    it('should navigate to partner window and click the Delete Customer button', () => {
      utils.expectIsDisplayed(partner.customerList);
      navigation.expectDriverCurrentUrl('customers');
      utils.click(element(by.cssContainingText('.ui-grid-cell', CUSTOMER_NAME)));
    });
    it('should click the Delete Customer button', () => {
      utils.click(partner.deleteCustomerButton);
      utils.waitForModal().then(() => {
        utils.click(partner.deleteCustomerOrgConfirm).then(() => {
          notifications.assertSuccess(CUSTOMER_NAME, 'successfully deleted');
        });
      });
    });
  });
});
