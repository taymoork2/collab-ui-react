import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallPlacesPage } from '../../pages/CallPlaces.page';

const CallPlaces = new CallPlacesPage();

describe('Huron Functional: add-places', () => {
  const customer = huronCustomer('add-place');
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

  it('should navigate to places page', () => {
    utils.click(CallPlaces.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });

  describe('Internal Places Section', () => {
    describe('create a new place with Phone Dialing only', () => {
      it('should show an option to add new place', () => {
        utils.click(CallPlaces.addNewPlaceEmpty);
        utils.expectIsDisplayed(CallPlaces.newPlaceInput);
      });
      it('should take a new location input and allow to save', () => {
        utils.expectIsDisabled(CallPlaces.nxtBtn);
        utils.sendKeys(CallPlaces.newPlaceInput, 'Naboo');
        utils.expectIsEnabled(CallPlaces.nxtBtn);
      });
      it('should go to device selection page and select a device', () => {
        utils.click(CallPlaces.nxtBtn);
        utils.expectIsDisabled(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.selectHuron);
        utils.expectIsEnabled(CallPlaces.nxtBtn2);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(CallPlaces.nxtBtn2);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '304');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(CallPlaces.nxtBtn3);
        utils.expectIsDisplayed(CallPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(CallPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark room', () => {
      it('should show an option to add place', () => {
        utils.click(CallPlaces.addNewPlace);
        utils.expectIsDisplayed(CallPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(CallPlaces.nxtBtn);
        utils.sendKeys(CallPlaces.newPlaceInput, 'Jedha');
        utils.expectIsEnabled(CallPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(CallPlaces.nxtBtn);
        utils.expectIsDisabled(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.selectCloudberry);
        utils.expectIsEnabled(CallPlaces.nxtBtn2);
      });
      it('should advance to service select and default to Spark only', () => {
        utils.click(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.sparkOnlyRadio);
        utils.expectIsEnabled(CallPlaces.nxtBtn4);
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(CallPlaces.nxtBtn4);
        utils.expectIsDisplayed(CallPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(CallPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark + Phone Dialing room', () => {
      it('should show an option to add place', () => {
        utils.click(CallPlaces.addNewPlace);
        utils.expectIsDisplayed(CallPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(CallPlaces.nxtBtn);
        utils.sendKeys(CallPlaces.newPlaceInput, 'Eadu');
        utils.expectIsEnabled(CallPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(CallPlaces.nxtBtn);
        utils.expectIsDisabled(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.selectCloudberry);
        utils.expectIsEnabled(CallPlaces.nxtBtn2);
      });
      it('should advance to service select and select Spark + Phone Dialing', () => {
        utils.click(CallPlaces.nxtBtn2);
        utils.click(CallPlaces.sparkPhoneRadio);
        utils.expectIsEnabled(CallPlaces.nxtBtn4);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(CallPlaces.nxtBtn4);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '305');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(CallPlaces.nxtBtn3);
        utils.expectIsDisplayed(CallPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(CallPlaces.closeGrp);
      });
    });

    describe('Verify setup', () => {
      describe('Test Naboo (Spark + Spark Call place) setup', () => {
        it('should list newly added place by search', () =>{
          utils.click(CallPlaces.searchPlaces);
          utils.sendKeys(CallPlaces.searchBar, 'Naboo');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(CallPlaces.clickLocation);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(CallPlaces.overviewPg);
          });
          it('should have Service section', () =>{
            utils.expectIsDisplayed(CallPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(CallPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(CallPlaces.callClick);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(CallPlaces.callStngsPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(CallPlaces.dirNumSct);
          });
          it('should have a Features section', () => {
            utils.expectIsDisplayed(CallPlaces.featuresSct);
          });
          it('should have Speed Dials in the Features section', () => {
            utils.expectIsDisplayed(CallPlaces.callOverview.features.speedDials);
          });
          it('should click on Primary Directory Number', () => {
            utils.click(CallPlaces.primaryClick);
          });
          it('should land on Line Configuration page', () => {
            utils.expectIsDisplayed(CallPlaces.LineConfigPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(CallPlaces.dirNumSct);
          });
          it('should have Call Forwarding section', () => {
            utils.expectIsDisplayed(CallPlaces.callFwdSct);
          });
          it('should have Simultaneous Calls section', () => {
            utils.expectIsDisplayed(CallPlaces.simulCallSct);
          });
          it('should have Caller ID section', () => {
            utils.expectIsDisplayed(CallPlaces.callerIdSct);
          });
          it('should have Auto Answer section', () => {
            utils.expectIsDisplayed(CallPlaces.autoAnsSct);
          });
          it('should have Shared Line section', () => {
            utils.expectIsDisplayed(CallPlaces.sharedLineSct);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(CallPlaces.sideNavClose);
            utils.expectIsNotDisplayed(CallPlaces.overviewPg);
          });
        });
      });

      describe('Test Jedha (Spark-only place without PSTN service) setup', () => {
        it('should clear previous search and search for Jedha', () => {
          utils.click(CallPlaces.clearSearchPlace);
          utils.sendKeys(CallPlaces.searchBar, 'Jedha');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(CallPlaces.clickLocation2);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(CallPlaces.overviewPg);
          });
          it('should have Service section', () => {
            utils.expectIsDisplayed(CallPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(CallPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(CallPlaces.callClick2);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(CallPlaces.callStngsPg);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(CallPlaces.sideNavClose);
            utils.expectIsNotDisplayed(CallPlaces.overviewPg);
          });
        });
      });

      describe('Test Eadu (Spark-only place with PSTN service) setup', () => {
        it('should clear previous search and search for Eadu', () => {
          utils.click(CallPlaces.clearSearchPlace);
          utils.sendKeys(CallPlaces.searchBar, 'Eadu');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(CallPlaces.clickLocation3);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(CallPlaces.overviewPg);
          });
          it('should have Service section', () => {
            utils.expectIsDisplayed(CallPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(CallPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(CallPlaces.callClick);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(CallPlaces.callStngsPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(CallPlaces.dirNumSct);
          });
          it('should have a Features section', () => {
            utils.expectIsDisplayed(CallPlaces.featuresSct);
          });
          it('should click on Primary Directory Number', () => {
            utils.click(CallPlaces.primaryClick);
          });
          it('should land on Line Configuration page', () => {
            utils.expectIsDisplayed(CallPlaces.LineConfigPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(CallPlaces.dirNumSct);
          });
          it('should have Caller ID section', () => {
            utils.expectIsDisplayed(CallPlaces.callerIdSct);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(CallPlaces.sideNavClose);
            utils.expectIsNotDisplayed(CallPlaces.overviewPg);
          });
        });
      });
    });
  });
});
