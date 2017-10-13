import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { CallPickupPage } from '../../pages/callPickup.page';

const callFeatures = new CallFeaturesPage();
const callPickup = new CallPickupPage();

describe('Huron Functional: add call pickup', () => {
  const customer = huronCustomer({
    test: 'add-callPickUp',
    users: { noOfUsers: 4, noOfDids: 0 },
  });

  const USERS = customer.users;

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

  describe('Take to call features page', () => {
    it('should take to call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });

    it('should click on call pickup button', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.piFeatureButton);
    });

    it('should be on new pick up create page', () => {
      utils.expectIsDisplayed(callPickup.featureTitle);
    });

    it('should display the close panel', () => {
      utils.expectIsDisplayed(callPickup.closePanel);
    });

    it('should display the next arrow', () => {
      utils.expectIsDisplayed(callPickup.nextArrow);
    });

    it('should input call pickup name', () => {
      utils.sendKeys(callPickup.nameOfPickup, 'test_CallPickUp');
      utils.click(callPickup.nextArrow);
    });

    it('should click green btn', () => {
      utils.click(callPickup.nextArrow);
    });

    it('should send keys to select members', () => {
      utils.sendKeys(callPickup.memberInput, USERS[0].email);
    });

    it('should select the user', () => {
      utils.expectIsDisplayed(callPickup.memberDrop);
      utils.sendKeys(callPickup.memberInput, protractor.Key.ENTER);
    });

    it('should send keys to 2nd members', () => {
      utils.sendKeys(callPickup.memberInput, USERS[1].email);
    });

    it('should select the 2nd user', () => {
      utils.expectIsDisplayed(callPickup.memberDrop);
      utils.sendKeys(callPickup.memberInput, protractor.Key.ENTER);
    });

    it('should save the feature', () => {
      utils.expectIsNotDisplayed(callPickup.saveBtnDisabled);
      utils.click(callPickup.saveBtn);
      navigation.expectDriverCurrentUrl('services/call-features');
    });

    it('should display feature cards', () => {
      utils.expectIsDisplayed(callPickup.featureCards);
    });
  });
});
