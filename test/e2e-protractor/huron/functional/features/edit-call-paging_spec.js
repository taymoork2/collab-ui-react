import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { CallPagingPage } from '../../pages/callPageFeature.page';

const callFeatures = new CallFeaturesPage();
const callPaging = new CallPagingPage();

/* globals navigation */

describe('Huron Functional: call-paging-feat', () => {
  const customer = huronCustomer({
    test: 'call-paging-edit',
    users: { noOfUsers: 3, noOfDids: 2 },
    places: { noOfPlaces: 3, noOfDids: 1 },
    doCallPaging: true,
  });

  const USERS = customer.users;
  const PLACES = customer.places;

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  const GROUP_RENAME = 'Starkiller Base';
  const EXPECT_URL = 'huronPagingGroupEdit';
  const EDIT_EXTENSION = '376'

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });

  describe('Check for configured features', () => {
    describe('Paging Group Settings', () => {
      it('should be an href to Huron call features page', () => {
        navigation.clickServicesTab();
        utils.click(callFeatures.callFeatures);
        navigation.expectDriverCurrentUrl('call-features');
      });
      it('should click on existing call paging groupd', () => {
        utils.click(callFeatures.card);
      });
      it('should be on call paging edit page', () => {
        navigation.expectDriverCurrentUrl(EXPECT_URL);
      });
      it('should edit call paging group name', () => {
        utils.clear(callFeatures.editGroupName);
        utils.sendKeys(callFeatures.editGroupName, GROUP_RENAME);
      });
      it('should edit call paging group extension', () => {
        utils.selectDropdown('.csSelect-container[name="pagingGroupNumber"]', EDIT_EXTENSION);
      });
      it('should save changes', () => {
        utils.click(callFeatures.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Members', () => {
      it('should remove a member', () => {
        utils.click(callPaging.deleteSecondCard);
      });
      it('should add a new member', () => {
        utils.sendKeys(callPaging.addMembers, USERS[1].name.givenName);
        utils.click(callPaging.cpAutofillDropdown);
      });
      it('should search for a member', () => {
        utils.sendKeys(callPaging.memberSearch, PLACES[0].name);
        utils.expectIsDisplayed(callPaging.memberSearchResult1);
      });
      it('should save changes', () => {
        utils.click(callFeatures.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Initiators', () => {
      it('should click All Users and Places radio', () => {
        utils.click(callPaging.allUsersRadio);
      });
      it('should click All Paging Group Members radio', () => {
        utils.click(callPaging.allGroupRadio);
      });
      it('should click Custom radio', () => {
        utils.click(callPaging.customRadio);
      });
      it('should delete a card', () => {
        utils.click(callPaging.deleteLastCard);
      });
      it('should add a card to the group', () => {
        utils.sendKeys(callPaging.pgInitiatorInput, USERS[1].name.givenName);
        utils.click(callPaging.cpAutofillDropdown);
      });
      it('should search for an initiator', () => {
        utils.sendKeys(callPaging.searchInitiator, PLACES[0].name);
        utils.expectIsDisplayed(callPaging.memberSearchResult2);
      });
      it('should save changes', () => {
        utils.click(callFeatures.editSave).then(() => {
          notifications.assertSuccess();
        });
      });
    });

    describe('Back to main menu and remove card', () => {
      it('should click back', () => {
        utils.click(callFeatures.backButton);
        navigation.expectDriverCurrentUrl('call-features');
      });
      it('should remove existing Paging group', () => {
        utils.click(callFeatures.closeBtn);
        utils.click(callFeatures.confirmDelete);
      });
    });
  });
});
