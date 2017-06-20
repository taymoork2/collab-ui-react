import * as provisioner from '../../provisioner/provisioner';
import * as os from 'os';
import { AtlasTrial, TrialOffer, Offers } from '../../provisioner/atlas-trial';
import { CmiCustomer } from '../../provisioner/cmi-customer';
import { CmiSite } from '../../provisioner/cmi-site';
import { CmiNumberRange } from '../../provisioner/cmi-number-range';
import { CallFeaturesPage } from '../pages/callFeatures.page';

const callFeatures = new CallFeaturesPage();

/* global LONG_TIMEOUT */

describe('Huron Functional: call-features', () => {
  const testPartner = 'huron-ui-test-partner';
  let customerName;

  beforeAll(done => {
    customerName = `${os.userInfo().username}_call-features`;
    
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

  it('should be an href to Huron call features page', () => {
    navigation.clickServicesTab();
    utils.click(callFeatures.callFeatures);
    utils.expectIsDisplayed(callFeatures.newFeatureButton);
  });
  
  it('should display buttons for provisioning each feature', () => {
    utils.click(callFeatures.newFeatureButton);
    utils.expectIsDisplayed(callFeatures.createNewFeatureModalTitle);
    utils.expectIsDisplayed(callFeatures.AaFeatureButton);
    utils.expectIsDisplayed(callFeatures.HgFeatureButton);
    utils.expectIsDisplayed(callFeatures.CpFeatureButton);
    utils.expectIsDisplayed(callFeatures.PgFeatureButton);
    utils.expectIsDisplayed(callFeatures.PiFeatureButton);
    utils.expectIsDisplayed(callFeatures.CloseBtn);
  });

  it('should close feature modal and on new feature page', () => {
    utils.click(callFeatures.CloseBtn);
    utils.expectIsDisplayed(callFeatures.newFeatureButton);
  });

});
