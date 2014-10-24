'use strict'

var PartnerHomePage = function(){

  this.newTrial = {
    customerName : 'Atlas_Test_Trial',
    customerEmail : 'Atlas_Test_Trial@gmail.com'
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

  this.refreshButton = element(by.id('partnerRefreshData'));
  this.entitlementsChart = element(by.id('entitlementsChart'));
  this.entitlementsCount = element(by.binding('counts.entitlements'));
  this.activeUsersTab = element(by.cssContainingText('li a span','Daily Active Users'));
  this.activeUsersChart = element(by.id('dailyActiveUsersChart'));
  this.activeUsersCount = element(by.binding('counts.activeUsers'));
  this.averageCallsTab = element(by.cssContainingText('li a span','Average Calls Per User'));
  this.averageCallsChart = element(by.id('averageCallsChart'));
  this.averageCallsCount = element(by.binding('counts.averageCalls'));
  this.contentSharedTab = element(by.cssContainingText('li a span','Total Content Shared'));
  this.contentSharedChart = element(by.id('contentSharedChart'));
  this.contentSharedCount = element(by.binding('counts.contentShared'));
  this.noResultsAvailable = element(by.cssContainingText('span','No results available'));
  this.errorProcessing = element(by.cssContainingText('span','Error processing request'));

  this.assertDisabled = function(id){
      expect(element(by.id(id)).getAttribute('disabled')).toBeTruthy();
  };

};

module.exports = PartnerHomePage;