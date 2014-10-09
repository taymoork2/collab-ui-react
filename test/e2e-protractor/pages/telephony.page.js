'use strict'

var TelephonyPage = function(){
  this.telephonyPanel = element(by.id('huronPanel'));
  this.directoryNumbers = element.all(by.repeater('directoryNumber in userDnList'));
  this.voicemailFeature = element(by.cssContainingText('.sub-service','Voicemail'));
  this.snrFeature = element(by.cssContainingText('.sub-service','Single Number Reach'));

  this.saveButton = element.all(by.buttonText('Save')).filter(function(elem){
    return elem.isDisplayed().then(function(isDisplayed){
      return isDisplayed;
    });
  });

  this.directoryNumberSelect = element(by.model('assignedInternalNumber.id'));

  this.forwardAllRadio = element(by.css("input[ng-model='forward'][value='all']"));
  this.forwardBusyAwayRadio = element(by.css("input[ng-model='forward'][value='busy']"));
  this.forwardAll = element(by.id('cfa'));
  this.forwardBusy = element(by.id('cfb'));
  this.forwardAway = element(by.id('cfna'));
  this.forwardExternalCalls = element(by.id('ckForwardExternalCalls'));

  this.voicemailSwitch = element(by.model('voicemailEnabled'));

  this.snrSwitch = element(by.model('singleNumberReachEnabled'));
  this.snrNumber = element(by.id('number'));
}

module.exports = TelephonyPage;