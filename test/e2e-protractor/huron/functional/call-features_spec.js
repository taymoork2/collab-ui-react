import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../pages/callFeatures.page';

const callFeatures = new CallFeaturesPage();

describe('Huron Functional: call-features', () => {
  const customer = huronCustomer({ test: 'call-features' });

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

  describe('No huron features provisioned', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
      utils.expectIsDisplayed(callFeatures.newFeatureButton);
    });

    it('should display buttons for provisioning each feature', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
      utils.expectIsDisplayed(callFeatures.aaFeatureButton);
      utils.expectIsDisplayed(callFeatures.hgFeatureButton);
      utils.expectIsDisplayed(callFeatures.cpFeatureButton);
      utils.expectIsDisplayed(callFeatures.pgFeatureButton);
      utils.expectIsDisplayed(callFeatures.piFeatureButton);
      utils.expectIsDisplayed(callFeatures.closeBtn);
    });

    it('should close feature modal and display new feature page', () => {
      utils.click(callFeatures.closeBtn);
      utils.expectIsDisplayed(callFeatures.newFeatureButton);
    });
  });
});
