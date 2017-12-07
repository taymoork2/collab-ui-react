import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { CallPagingPage } from '../../pages/callPageFeature.page.js';

const callFeatures = new CallFeaturesPage();
const callPaging = new CallPagingPage();

describe('Huron Functional: add call pickup', () => {
  const customer = huronCustomer({
    test: 'call-paging-create',
    users: { noOfUsers: 1, noOfDids: 1 },
    places: { noOfPlaces: 1, noOfDids: 1 },
  });

  const USERS = customer.users;
  const PLACES = customer.places;
  const PG_NAME = 'Starkiller Base';
  const PG_NUM = '375';

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });

  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name)
      .then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });

  describe('Create a new Call Page group', () => {
    it('should land on call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });
    it('should click on call paging button', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.pgFeatureButton);
    });
    it('should name the group', () => {
      utils.sendKeys(callPaging.nameCpGroup, PG_NAME);
    });
    it('should click next arrow', () => {
      utils.click(callFeatures.nextButton);
    });
    it('should set paging group number', () => {
      utils.sendKeys(callPaging.cpGroupNumber, PG_NUM);
      utils.click(callPaging.cpAutofillDropdown);
    });
    it('should click next button', () => {
      utils.click(callFeatures.nextButton);
    });
    it('should input 1 name and 1 place to add to call paging group', () => {
      utils.sendKeys(callPaging.cpAddMember, USERS[0].name.givenName);
      utils.click(callPaging.cpAutofillDropdown);
      utils.sendKeys(callPaging.cpAddMember, PLACES[0].name);
      utils.click(callPaging.cpAutofillDropdown);
      utils.click(callFeatures.nextButton);
    });
    it('should select initiators', () => {
      utils.click(callPaging.allMembersRadio);
      utils.click(callPaging.customRadio);
    });
    it('should input a name and place for initiator', () => {
      utils.sendKeys(callPaging.pgInitiatorInput, USERS[0].name.givenName);
      utils.click(callPaging.cpAutofillDropdown);
      utils.sendKeys(callPaging.pgInitiatorInput, PLACES[0].name);
      utils.click(callPaging.cpAutofillDropdown);
    });
    it('should create the new paging group', () => {
      utils.click(callFeatures.nextButton);
      utils.expectIsDisplayed(element(by.cssContainingText('p.ellipsis', PG_NAME)));
    });
  });

  describe('Delete call group and cancel create', () => {
    it('should close the saved successfully modal', () => {
      utils.waitForPresence(callPaging.closeModal);
      utils.click(callPaging.closeModal);
    });
    it('should delete newly created pg', () => {
      utils.waitForPresence(callFeatures.deleteFeature);
      utils.click(callFeatures.deleteFeature);
      utils.click(callFeatures.confirmDelete);
    });
    it('should click on call paging button', () => {
      utils.waitForPresence(callFeatures.newFeatureButton);
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.pgFeatureButton);
      utils.click(callPaging.closeModal);
    });
    it('should name the group', () => {
      utils.sendKeys(callPaging.nameCpGroup, PG_NAME);
    });
    it('should click next arrow', () => {
      utils.click(callFeatures.nextButton);
    });
    it('should set paging group number', () => {
      utils.sendKeys(callPaging.cpGroupNumber, PG_NUM);
      utils.click(callPaging.cpAutofillDropdown);
    });
    it('should click next button', () => {
      utils.click(callFeatures.nextButton);
    });
    it('should input 1 name and 1 place to add to call paging group', () => {
      utils.sendKeys(callPaging.cpAddMember, USERS[0].name.givenName);
      utils.click(callPaging.cpAutofillDropdown);
      utils.sendKeys(callPaging.cpAddMember, PLACES[0].name);
      utils.click(callPaging.cpAutofillDropdown);
    });
    it('should remove a card', () => {
      utils.click(callPaging.deleteCard);
    });
    it('should click next button', () => {
      utils.click(callFeatures.nextButton);
    });
    it('should click `X` to cancel creation', () => {
      utils.click(callPaging.cancelFeatureCreation);
      utils.click(callFeatures.confirmDelete);
    });
  });
});
