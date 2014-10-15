'use strict'

var PartnerHomePage = function(){

  this.trialsPanel = element(by.id('trialsPanel'));
  this.addButton = element(by.id('trialAddButton'));
  this.addButton = element(by.id('trialAddButton'));
  this.startTrialButton = element(by.id('startTrialButton'));
  this.customerNameInput = element(by.id('customerNameInput'));
  this.customerEmailInput = element(by.id('customerEmailInput'));
  this.licenseCount = element(by.id('licenseCount'));
  this.licenseDuration = element(by.id('licenseDuration'));
  this.editTrialButton = element(by.id('editTrialButton'));
  this.newTrialName = element(by.binding('trial.'))

};

module.exports = PartnerHomePage;