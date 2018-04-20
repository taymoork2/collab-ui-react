import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallPlacesPage } from '../../pages/callPlaces.page';
import { CallUserPage } from '../../pages/callUser.page';

const CallPlaces = new CallPlacesPage();
const CallUser = new CallUserPage();

describe('Huron Functional: places-features', () => {
  const customer = huronCustomer({
    test: 'places-feature',
    offers: ['CALL', 'ROOMSYSTEMS'],
    places: { noOfPlaces: 3 },
  });
  const PLACES = customer.places;

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
    utils.click(navigation.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });

  describe('Add places flow', () => {
    describe('Place Call Features', () => {
      it('should list newly added place by search', () => {
        utils.click(CallPlaces.searchPlaces);
        utils.searchAndClick(PLACES[0].name);
      });
      it('should click on newly added place and bring up side menu', () => {
        utils.click(CallPlaces.clickLocation);
      });
      it('should select Call under services and navigate to the next page', () => {
        utils.click(CallPlaces.callClick);
        utils.expectIsDisplayed(CallPlaces.featuresSct);
      });

      describe('Dialing Restrictions', () => {
        it('should navigate to Dialing Restrictions details view', () => {
          // TODO: Need to add tests
          utils.click(CallUser.callOverview.features.dialingRestrictions);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.nationaDialing.title);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.premiumDialing.title);
          utils.expectIsDisplayed(CallUser.dialingRestrictions.internationalDialing.title);
        });
        it('should navigate back to call details view', () => {
          utils.click(CallPlaces.callSubMenu);
          utils.expectIsDisplayed(CallPlaces.callOverview.features.title);
        });
      });

      xdescribe('External Call Transfer/Conference', () => {
        it('should navigate to External Call Transfer/Conference details view', () => {
          // TODO: Need to add tests
        });
        it('should navigate back to call details view', () => {
          utils.click(CallPlaces.callSubMenu);
          utils.expectIsDisplayed(CallPlaces.callOverview.features.title);
        });
      });

      it('should exit side navigation and return to main Places page', () => {
        utils.click(CallPlaces.sideNavClose);
        utils.expectIsNotDisplayed(CallPlaces.callOverview.main);
      });
    });
  });
});
