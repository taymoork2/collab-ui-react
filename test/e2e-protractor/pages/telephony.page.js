'use strict'

var TelephonyPage = function(){
  this.telephonyPanel = element(by.id('huronPanel'));
  this.directoryNumbers = element.all(by.repeater('directoryNumber in telephonyInfo.directoryNumbers'));
  this.voicemailFeature = element(by.cssContainingText('.sub-service','Voicemail'));
  this.snrFeature = element(by.cssContainingText('.sub-service','Single Number Reach'));
  this.close = element(by.id('exitPreviewButton'));

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
  this.voicemailStatus = element(by.id('voicemailStatus'));

  this.snrSwitch = element(by.model('singleNumberReachEnabled'));
  this.snrNumber = element(by.id('number'));
  this.snrStatus = element(by.id('snrStatus'));
}

module.exports = TelephonyPage;