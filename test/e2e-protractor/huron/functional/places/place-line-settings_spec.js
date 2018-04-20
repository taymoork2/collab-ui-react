import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallPlacesPage } from '../../pages/callPlaces.page';
import { CallUserPlacePage } from '../../pages/callUserPlace.page';

const callPlacePage = new CallPlacesPage();
const callUserPlacePage = new CallUserPlacePage();


/* globals navigation, users, telephony */
describe('Huron Functional: place-line-settings', () => {
  const customer = huronCustomer({
    test: 'place-line-settings',
    offers: ['CALL', 'ROOMSYSTEMS'],
    places: { noOfPlaces: 2, noOfDids: 0 },
  });

  const PLACES = customer.places;

  const DESTINATION_E164 = '2145550000';
  const DESTINATION_URI = 'callforward@uri.com';
  const DESTINATION_CUSTOM = '890';
  const DESTINATION_TYPE_EXTERNAL = 'External';
  const DESTINATION_TYPE_URI = 'URI Address';
  const CUSTOM = 'Custom';
  const BLOCKED = 'Blocked Outbound Caller ID';

  /* ---------------------------------------------------------------
     Similar Line Configuration test cases are also in Users.
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

  it('should navigate to Places overview page', () => {
    utils.click(navigation.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });
  it('should enter the place details on the search bar and Navigate to user details view', () => {
    utils.click(callPlacePage.searchPlaces);
    utils.searchAndClick(PLACES[1].name);
  });
  it('should select Call under services and navigate to the next page', () => {
    utils.click(callPlacePage.callClick);
    utils.expectIsDisplayed(callPlacePage.featuresSct);
  });

  describe('Line Settings', () => {
    it('should navigate to Line Settings details view', () => {
      utils.click(callUserPlacePage.callOverview.directoryNumbers.number);
      utils.expectIsDisplayed(callUserPlacePage.lineConfiguration.title);
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

      // Edit Directory Number
      it('should be able to edit the extension and save', () => {
        browser.driver.sleep(1000);
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
        browser.driver.sleep(1000);
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
    });

    describe('Call Forwarding Forward Busy or Away', () => {
      //Forward Busy No Answer with same interna/external destinations
      it('should select Option Call Forward Busy or Away', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
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

      //Forward Busy No Answer External call destinations Differently
      it('should be able to select call forward Busy or Away with different External destination', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.setCheckboxIfDisplayed(callUserPlacePage.callForwarding.forwardBusyExternal, true, 100);
      });

      it('should be able to add Call Forward Busy or Away with different External Custom Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectLastDropdown('.csSelect-container[name="CallDestTypeSelect"]', CUSTOM);
        utils.clear(callUserPlacePage.callForwarding.busyExternalInputCustom);
        utils.sendKeys(callUserPlacePage.callForwarding.busyExternalInputCustom, DESTINATION_CUSTOM);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should be able to add Call Forward Busy or Away with different External Destination Number', () => {
        utils.click(callUserPlacePage.callForwarding.radioBusyOrAway);
        utils.selectLastDropdown('.csSelect-container[name="CallDestTypeSelect"]', DESTINATION_TYPE_EXTERNAL);
        utils.sendKeys(callUserPlacePage.callForwarding.busyExternalInputPhone, DESTINATION_E164);
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
        utils.sendKeys(callUserPlacePage.callerId.customName, 'USER NAME');
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

      it('should add a member', () => {
        utils.sendKeys(callUserPlacePage.sharedLine.inputMember, PLACES[0].name);
        browser.driver.sleep(1000);
        utils.sendKeys(callUserPlacePage.sharedLine.inputMember, protractor.Key.ENTER);
        browser.driver.sleep(1000);
        utils.expectIsDisplayed(callUserPlacePage.sharedLine.accordionMember);
        utils.expectText(callUserPlacePage.sharedLine.accordionMember, PLACES[0].name);
        utils.click(callUserPlacePage.saveButton).then(() => {
          notifications.assertSuccess();
        });
      });
      it('should remove a member', () => {
        utils.expectIsDisplayed(callUserPlacePage.sharedLine.accordionMember);
        utils.expectText(callUserPlacePage.sharedLine.accordionMember, PLACES[0].name);
        utils.click(callUserPlacePage.sharedLine.sharedMember);
        utils.click(callUserPlacePage.sharedLine.removeMember);
        utils.click(callUserPlacePage.sharedLine.removeMemberBtn).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    it('should navigate back to call details view', () => {
      utils.click(callPlacePage.callSubMenu);
      utils.expectIsDisplayed(callPlacePage.dirNumSct);
    });
  });

  describe('Add a new line', () => {
    it('should display add a new line link', () => {
      utils.expectIsDisplayed(callUserPlacePage.callOverview.addNewLine);
    });

    it('should be on add line page', () => {
      utils.click(callUserPlacePage.callOverview.addNewLine);
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
