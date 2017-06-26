import * as provisioner from '../../provisioner/provisioner';
import * as os from 'os';
import { AtlasTrial, TrialOffer, Offers } from '../../provisioner/atlas-trial';
import { CmiCustomer } from '../../provisioner/cmi-customer';
import { CmiSite } from '../../provisioner/cmi-site';
import { CmiNumberRange } from '../../provisioner/cmi-number-range';
import { AddPlacesPage } from '../pages/addPlaces.page';

const addPlaces = new AddPlacesPage();

describe('Huron Functional: add-places-room', () => {
  const testPartner = 'huron-ui-test-partner';
  let customerName;

  beforeAll(done => {
    customerName = `${os.userInfo().username}_add-place-room`;

    let offers = [];
    offers.push(new TrialOffer({
      id: Offers.OFFER_CALL,
      licenseCount: 100,
    }));
    offers.push(new TrialOffer({
      id: Offers.OFFER_ROOM_SYSTEMS,
      licenseCount: 5,
    }));

    const trial = new AtlasTrial({
      customerName: customerName,
      customerEmail: `huron.ui.test.partner+${customerName}@gmail.com`,
      offers: offers,
    });

    const numberRange = new CmiNumberRange({
      beginNumber: '300',
      endNumber: '399',
    });

    provisioner.provisionCustomerAndLogin(testPartner, trial, new CmiCustomer(), new CmiSite(), numberRange)
     .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(testPartner, customerName).then(done);
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
    describe('create a new place with Spark room', () => {
      it('should show an option to add new place', () => {
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
        utils.click(addPlaces.closeGrp)
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

    describe('Verify setup', () => {
      describe('Test Jedha setup', () => {
        it('should list newly added places and search search for Jedha', () => {
          utils.click(addPlaces.searchPlaces);
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
            utils.expectIsDisplayed(addPlaces.prfrdLangDd)
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
