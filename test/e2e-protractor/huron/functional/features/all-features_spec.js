import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';


const callFeatures = new CallFeaturesPage();

describe('Huron Functional: All Features Test', () => {
  const customer = huronCustomer({
    test: 'all-features-enabled',
    doAllFeatures: true,
  });

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

  describe('Check for configured features', () => {
    describe('Check Call Park', () => {
      it('should navigagte to call features page', () => {
        navigation.clickServicesTab();
        utils.click(callFeatures.callFeatures);
        navigation.expectDriverCurrentUrl('call-features');
      });
      it('should click Call Park sorting', () => {
        utils.click(callFeatures.callPark);
        utils.click(callFeatures.callPark);
      });
      it('should only display one card', () => {
        utils.waitForPresence(callFeatures.featureCard);
        callFeatures.countCard.count().then(function (amount) {
          expect(amount).toEqual(1);
        });
      });
      it('should click on the card', () => {
        utils.click(callFeatures.card);
      });
      it('should land on the Call Park edit page', () => {
        utils.expectIsDisplayed(callFeatures.cpHeading);
      });
      it('should return to the features list', () => {
        utils.click(callFeatures.backButton);
      });
    });

    describe('Check Call Pickup', () => {
      it('should click Call Pickup sorting', () => {
        utils.click(callFeatures.callPickup);
      });
      it('should only display one card', () => {
        utils.waitForPresence(callFeatures.featureCard);
        callFeatures.countCard.count().then(function (amount) {
          expect(amount).toEqual(1);
        });
      });
      it('should click on the card', () => {
        utils.click(callFeatures.card);
      });
      it('should land on the Call Pickup edit page', () => {
        utils.expectIsDisplayed(callFeatures.cpuHeading);
      });
      it('should return to the features list', () => {
        utils.click(callFeatures.backButton);
      });
    });

    describe('Check Hunt Group', () => {
      it('should click Hunt Group sorting', () => {
        utils.click(callFeatures.huntGroup);
      });
      it('should only display one card', () => {
        utils.waitForPresence(callFeatures.featureCard);
        callFeatures.countCard.count().then(function (amount) {
          expect(amount).toEqual(1);
        });
      });
      it('should click on the card', () => {
        utils.click(callFeatures.card);
      });
      it('should land on the Hunt Group edit page', () => {
        utils.expectIsDisplayed(callFeatures.hgHeading);
      });
      it('should return to the features list', () => {
        utils.click(callFeatures.backButton);
      });
    });

    describe('Check Paging Group', () => {
      it('should click Paging Group sorting', () => {
        utils.click(callFeatures.pagingGroup);
      });
      it('should only display one card', () => {
        utils.waitForPresence(callFeatures.featureCard);
        callFeatures.countCard.count().then(function (amount) {
          expect(amount).toEqual(1);
        });
      });
      it('should click on the card', () => {
        utils.click(callFeatures.card);
      });
      it('should land on the Paging Group edit page', () => {
        utils.expectIsDisplayed(callFeatures.pgHeading);
      });
      it('should return to the features list', () => {
        utils.click(callFeatures.backButton);
      });
    });
  });
});
