import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { CallPickupPage } from '../../pages/callPickup.page';

const callFeatures = new CallFeaturesPage();
const callPickup = new CallPickupPage();

describe('Huron Functional: Edit Call Pickup', () => {
  const customer = huronCustomer({
    test: 'edit-call-pickup',
    users: { noOfUsers: 4, noOfDids: 0 },
    doCallPickup: true,
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

  describe('should take to call features page', () => {
    it('should take to call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });

    it('should take to Call Pickup edit', ()=> {
      utils.expectIsDisplayed(callFeatures.callPickup);
      utils.expectIsDisplayed(callPickup.featureCards);
      utils.click(callFeatures.card);
      navigation.expectDriverCurrentUrl('#/features/pi/edit');
    });
  });

  describe('should edit call pickup feature', () => {
    it('should edit Call Pickup Name', ()=> {
      utils.click(callPickup.nameOfPickup);
      utils.clear(callPickup.nameOfPickup);
      utils.sendKeys(callPickup.nameOfPickup, 'Changed Pickup');
      utils.expectIsDisplayed(callPickup.saveButton);
      utils.click(callPickup.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });

    it('should edit Call Pickup Notification Timer', ()=> {
      utils.expectIsDisplayed(callFeatures.callPickup);
      utils.expectIsDisplayed(callPickup.featureCards);
      utils.click(callFeatures.card);
      navigation.expectDriverCurrentUrl('#/features/pi/edit');
      utils.clear(callPickup.timer);
      utils.sendKeys(callPickup.timer, '10');
      utils.expectIsDisplayed(callPickup.saveButton);
      utils.click(callPickup.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });

    it('should edit Call Pickup Notification behavior - playSound', ()=> {
      utils.expectIsDisplayed(callFeatures.callPickup);
      utils.expectIsDisplayed(callPickup.featureCards);
      utils.click(callFeatures.card);
      navigation.expectDriverCurrentUrl('#/features/pi/edit');

      utils.expectIsDisplayed(callPickup.playSoundCheckbox);
      utils.setCheckboxIfDisplayed(callPickup.playSoundCheckbox, false, 100);
      expect(utils.getCheckboxVal(callPickup.playSoundCheckbox)).toBeFalsy();
      utils.expectIsDisplayed(callPickup.saveButton);
    });

    it('should edit Call Pickup Notification behavior - callingParty', ()=> {
      utils.expectIsDisplayed(callPickup.callingPartyCheckbox);
      utils.setCheckboxIfDisplayed(callPickup.callingPartyCheckbox, false, 100);
      expect(utils.getCheckboxVal(callPickup.callingPartyCheckbox)).toBeFalsy();
      utils.expectIsDisplayed(callPickup.saveButton);
    });

    it('should edit Call Pickup Notification behavior - calledParty', ()=> {
      utils.expectIsDisplayed(callPickup.calledPartyCheckbox);
      utils.setCheckboxIfDisplayed(callPickup.calledPartyCheckbox, false, 100);
      expect(utils.getCheckboxVal(callPickup.calledPartyCheckbox)).toBeFalsy();
      utils.expectIsDisplayed(callPickup.saveButton);
      utils.click(callPickup.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });

    it('should renmove Call Pickup Member', ()=> {
      utils.expectIsDisplayed(callFeatures.callPickup);
      utils.expectIsDisplayed(callPickup.featureCards);
      utils.click(callFeatures.card);
      navigation.expectDriverCurrentUrl('#/features/pi/edit');
      utils.click(callPickup.chevron);
      utils.click(callPickup.remove);
    });

    it('should add Call Pickup Member', ()=> {
      utils.sendKeys(callPickup.memberInput, USERS[2].email);
      utils.expectIsDisplayed(callPickup.memberDrop);
      utils.sendKeys(callPickup.memberInput, protractor.Key.ENTER);
      utils.expectIsDisplayed(callPickup.saveButton);
      utils.click(callPickup.saveButton).then(() => {
        notifications.assertSuccess();
      });
    });
  });
});
