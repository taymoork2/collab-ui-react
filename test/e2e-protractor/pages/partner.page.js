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

  this.assertDisabled = function(id){
      expect(element(by.id(id)).getAttribute('disabled')).toBeTruthy();
  };

};

module.exports = PartnerHomePage;