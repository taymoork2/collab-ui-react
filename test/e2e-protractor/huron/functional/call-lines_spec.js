import * as provisioner from '../../provisioner/provisioner';
import * as os from 'os';
import { AtlasTrial, TrialOffer, Offers } from '../../provisioner/atlas-trial';
import { CmiCustomer } from '../../provisioner/cmi-customer';
import { CmiSite } from '../../provisioner/cmi-site';
import { CmiNumberRange } from '../../provisioner/cmi-number-range';
import { CallLinesPage } from '../pages/callLines.page';

const callLines = new CallLinesPage();

describe('Huron Functional: call-lines', () => {
  const testPartner = 'huron-ui-test-partner';
  let customerName;

  beforeAll(done => {
    customerName = `${os.userInfo().username}_call-lines`;

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
  describe('Call lines page test', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callLines.callLines);
    });
    it('should be on call-lines page', () => {
      navigation.expectDriverCurrentUrl('call-lines');
    });
    it('should display go back icon', () => {
      utils.expectIsDisplayed(callLines.iconGoBack);
    });
    it('should display Call as page title', () => {
      utils.expectIsDisplayed(callLines.pageTitleCall);
    });
    it('should display link for numbers', () => {
      utils.expectIsDisplayed(callLines.callLinesHRef);
    });
    it('should display link for features', () => {
      utils.expectIsDisplayed(callLines.callFeaturesHRef);
    });
    it('should display link for settings', () => {
      utils.expectIsDisplayed(callLines.callSettingsHRef);
    });
    it('should display link for order and history', () => {
      utils.expectIsDisplayed(callLines.orderHistory);
    });
    it('should display icon for search for order and history', () => {
      utils.expectIsDisplayed(callLines.iconSearch);
    });
    it('should display column for Internal Extensions', () => {
      utils.expectIsDisplayed(callLines.internalExt);
    });
    it('should display column for Phone Numbers', () => {
      utils.expectIsDisplayed(callLines.phoneNumbers);
    });
    it('should display column for Assinged To', () => {
      utils.expectIsDisplayed(callLines.assignedTo);
    });
    it('should display column for Actions', () => {
      utils.expectIsDisplayed(callLines.actionsBtn);
    });
    it('should have 300 as first internal ext', () => {
      utils.click(callLines.internalExt);
      expect(callLines.firstDN.getText()).toEqual(callLines.ascendingDn);
    });
    it('should have 399 as last internal ext', () => {
      utils.click(callLines.internalExt);
      expect(callLines.lastDN.getText()).toEqual(callLines.descendingDn);
    });
  });
});
