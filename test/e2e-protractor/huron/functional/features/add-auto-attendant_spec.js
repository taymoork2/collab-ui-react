import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallFeaturesPage } from '../../pages/callFeatures.page';
import { AutoAttendantPage } from '../../pages/autoAttendantFeature.page.js';

const callFeatures = new CallFeaturesPage();
const autoAttendant = new AutoAttendantPage();

describe('Huron Functional: add auto attendant', () => {
  const customer = huronCustomer({
    test: 'auto-attendant-create',
    users: { noOfUsers: 0, noOfDids: 0 },
    places: { noOfPlaces: 0, noOfDids: 0 },
  });

  const AA_NAME = 'Starkiller Base AA Basic';
  const AA_NAME_CUSTOM = 'Starkiller Base AA Custom';
  const AA_NAME_OPEN_CLOSED = 'Starkiller Base AA Open Closed';
  // const AA_NUM = '375';

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

  describe('Create an Auto Attendant Basic', () => {
    it('should land on call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });
    it('should click on auto attendant button', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.aaFeatureButton);
    });
    it('should select basic AA', () => {
      utils.wait(autoattendant.basicAA, 120000);
      utils.click(autoattendant.basicAA);
    });
    it('should name the AA', () => {
      utils.sendKeys(autoAttendant.newAAname, AA_NAME);
    });
    it('should click next arrow', () => {
      utils.click(callFeatures.nextButton).then(() => {
        notifications.assertSuccess();
      });
    });
    it('should close AA', () => {
      utils.click(autoattendant.closeEditButton);
    }, 120000);
  });

  describe('Create an Auto Attendant Custom', () => {
    it('should land on call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });
    it('should click on auto attendant button', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.aaFeatureButton);
    });
    it('should select basic AA', () => {
      utils.wait(autoattendant.customAA, 120000);
      utils.click(autoattendant.customAA);
    });
    it('should name the AA', () => {
      utils.sendKeys(autoAttendant.newAAname, AA_NAME_CUSTOM);
    });
    it('should click next arrow', () => {
      utils.click(callFeatures.nextButton).then(() => {
        notifications.assertSuccess();
      });
    });
    it('should close AA', () => {
      utils.click(autoattendant.closeEditButton);
    }, 120000);
  });

  describe('Create an Auto Attendant Open/Close', () => {
    it('should land on call feature page', () => {
      navigation.clickServicesTab();
      utils.click(callFeatures.callFeatures);
    });
    it('should click on auto attendant button', () => {
      utils.click(callFeatures.newFeatureButton);
      utils.click(callFeatures.aaFeatureButton);
    });
    it('should select basic AA', () => {
      utils.wait(autoattendant.openClosedAA, 120000);
      utils.click(autoattendant.openClosedAA);
    });
    it('should name the AA', () => {
      utils.sendKeys(autoAttendant.newAAname, AA_NAME_OPEN_CLOSED);
    });
    it('should click next arrow', () => {
      utils.click(callFeatures.nextButton).then(() => {
        notifications.assertSuccess();
      });
    });
  });
});
