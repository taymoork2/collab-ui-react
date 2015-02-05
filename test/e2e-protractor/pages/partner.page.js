'use strict'

var PartnerHomePage = function(){

  var randomNumber = utils.randomId();

  this.newTrial = {
    customerName : 'Atlas_Test_Trial_' + randomNumber,
    customerEmail : 'collabctg+Atlas_Test_Trial_' + randomNumber + '@gmail.com'
  };

  this.differentTrial = {
    customerName : 'collabctg+Atlas_Different',
    customerEmail : 'collabctg+Atlas_Different@gmail.com'
  };

  this.testuser = {
    username: 'atlaspartneradmin@atlas.test.com',
    password: 'C1sc0123!'
  };

  this.trialsPanel = element(by.id('trialsPanel'));
  this.addButton = element(by.id('trialAddButton'));
  this.startTrialButton = element(by.id('startTrialButton'));
  this.customerNameInput = element(by.id('customerNameInput'));
  this.customerEmailInput = element(by.id('customerEmailInput'));
  this.licenseCount = element(by.id('licenseCount'));
  this.licenseDuration = element(by.id('licenseDuration'));
  this.editTrialButton = element(by.id('editTrialButton'));
  this.newTrialName = element(by.binding('trial.'));
  this.saveSendButton = element(by.id('saveSendButton'));
  this.newTrialRow = element(by.id(this.newTrial.customerName));
  this.editTrialModal = element(by.id('editTrialDialog'));
  this.addTrialModal = element(by.id('addTrialDialog'));
  this.cancelTrialButton = element(by.id('cancelNewTrialButton'));
  this.customerNameForm =  element(by.id('customerNameForm'));
  this.customerEmailForm =  element(by.id('customerEmailForm'));
  this.refreshButton = element(by.id('partnerRefreshData'));
  this.entitlementsChart = element(by.id('avgEntitlementsdiv'));
  this.entitlementsCount = element(by.binding('counts.entitlements'));
  this.activeUsersTab = element(by.cssContainingText('li a span','Daily Active Users'));
  this.activeUsersChart = element(by.id('activeUsersdiv'));
  this.activeUsersCount = element(by.binding('counts.activeUsers'));
  this.averageCallsTab = element(by.cssContainingText('li a span','Average Calls Per User'));
  this.averageCallsChart = element(by.id('avgCallsdiv'));
  this.averageCallsCount = element(by.binding('counts.averageCalls'));
  this.contentSharedTab = element(by.cssContainingText('li a span','Total Content Shared'));
  this.contentSharedChart = element(by.id('contentShareddiv'));
  this.contentSharedCount = element(by.binding('counts.contentShared'));
  this.noResultsAvailable = element(by.cssContainingText('span','No results available'));
  this.errorProcessing = element(by.cssContainingText('span','Error processing request'));
  this.selectRow = element(by.binding('row.entity'));
  this.previewPanel = element(by.id('preview-panel'));
  this.customerInfo = element(by.id('customer-info'));
  this.trialInfo = element(by.id('trial-info'));
  this.actionsButton = element(by.id(this.newTrial.customerName + 'ActionsButton'));
  this.launchCustomerButton = element(by.id(this.newTrial.customerName + 'LaunchCustomerButton'));
  this.launchCustomerPanelButton = element(by.id('launchCustomer'));
  this.exitPreviewButton = element(by.id('exitPreviewButton'));
  this.partnerFilter = element(by.id('partnerFilter'));
  this.partnerEmail = element.all(by.binding('userName'));
  this.squaredTrialCheckbox = element(by.id('squaredTrial'));
  this.squaredUCTrialCheckbox = element(by.id('squaredUCTrial'));

  this.viewAllLink = element(by.id('viewAllLink'));
  this.customerList = element(by.id('customerListPanel'));

  this.assertDisabled = function(id){
    expect(element(by.id(id)).isEnabled()).toBeFalsy();
  };

  this.assertResultsLength = function() {
    element.all(by.binding('row.entity')).then(function(rows) {
      expect(rows.length).toBeGreaterThan(1);
    });
  };
};

module.exports = PartnerHomePage;