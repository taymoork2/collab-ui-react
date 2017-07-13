import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';
import { AddPlacesPage } from '../pages/addPlaces.page';

const addPlaces = new AddPlacesPage();

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
    utils.click(addPlaces.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });

  describe('Internal Places Section', () => {
    describe('create a new place with Phone Dialing only', () => {
      it('should show an option to add new place', () => {
        utils.click(addPlaces.addNewPlaceEmpty);
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
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '304');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn3);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark room', () => {
      it('should show an option to add place', () => {
        utils.click(addPlaces.addNewPlace);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Jedha');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectCloudberry);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should advance to service select and default to Spark only', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.click(addPlaces.sparkOnlyRadio);
        utils.expectIsEnabled(addPlaces.nxtBtn4);
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn4);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark + Phone Dialing room', () => {
      it('should show an option to add place', () => {
        utils.click(addPlaces.addNewPlace);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Eadu');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectCloudberry);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should advance to service select and select Spark + Phone Dialing', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.click(addPlaces.sparkPhoneRadio);
        utils.expectIsEnabled(addPlaces.nxtBtn4);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(addPlaces.nxtBtn4);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '305');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn3);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('Verify setup', () => {
      describe('Test Naboo setup', () => {
        it('should list newly added place by search', () =>{
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

      describe('Test Jedha setup', () => {
        it('should clear previous search and search for Jedha', () => {
          utils.click(addPlaces.clearSearchPlace);
          utils.sendKeys(addPlaces.searchBar, 'Jedha');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(addPlaces.clickLocation2);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
          it('should have Service section', () => {
            utils.expectIsDisplayed(addPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(addPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(addPlaces.callClick2);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(addPlaces.callStngsPg);
          });
          it('should have Preferred Language section with configure instructions', () => {
            utils.expectIsDisplayed(addPlaces.prfrdLang);
            utils.expectIsDisplayed(addPlaces.prfrdLangInst);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(addPlaces.sideNavClose);
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
        });
      });

      describe('Test Edau setup', () => {
        it('should clear previous search and search for Eadu', () => {
          utils.click(addPlaces.clearSearchPlace);
          utils.sendKeys(addPlaces.searchBar, 'Eadu');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(addPlaces.clickLocation3);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
          it('should have Service section', () => {
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
          it('should have Caller ID section', () => {
            utils.expectIsDisplayed(addPlaces.callerIdSct);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(addPlaces.sideNavClose);
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
        });
      });
    });
  });
});
