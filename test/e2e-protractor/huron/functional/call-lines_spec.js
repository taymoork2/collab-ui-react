import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron/huron-customer-config';
import { CallLinesPage } from '../pages/callLines.page';

const callLines = new CallLinesPage();

describe('Huron Functional: call-lines', () => {
  const customer = huronCustomer({ test: 'call-lines' });
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
  describe('Call lines page test', () => {
    it('should be an href to Huron call features page', () => {
      navigation.clickServicesTab();
      utils.click(callLines.callLines);
    });
    it('should be on call-lines page', () => {
      navigation.expectDriverCurrentUrl('call-lines');
    });
    it('should close banner if displayed', () => {
      utils.expectIsDisplayed(element(by.css('.cs-alert-banner-close')));
      utils.click(element(by.css('.cs-alert-banner-close')));
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
