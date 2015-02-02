'use strict'

var TelephonyPage = function(){
  this.telephonyPanel = element(by.id('huronPanel'));
  this.directoryNumbers = element.all(by.repeater('directoryNumber in vm.telephonyInfo.directoryNumbers track by directoryNumber.uuid'));
  this.primary = element(by.cssContainingText('span', 'Primary'));
  this.voicemailFeature = element(by.cssContainingText('.sub-service','Voicemail'))
    .element(by.cssContainingText('span', 'Voicemail'));
  this.snrFeature = element(by.cssContainingText('.sub-service','Single Number Reach'))
    .element(by.cssContainingText('span', 'Single Number Reach'));
  this.close = element(by.id('close-preview-button'));
  this.squaredUCCheckBox = element(by.id('chk_ciscoUC'));

  this.saveButton = element(by.css('.ent-detail-panel')).element(by.id('btn-save'));
  this.saveEntitlements = element(by.css('.user-entitlements-body')).element(by.id('btn-save'));
  this.removeButton = element(by.css('.ent-detail-panel')).element(by.id('btn-remove'));
  this.cancelDisassociation = element(by.css('.modal-template')).element(by.css('.btn-default'));
  this.disassociateLine = element(by.css('.modal-template')).element(by.css('.btn-danger'));

  this.forwardAllRadio = element(by.cssContainingText("span","Forward all calls"));
  this.forwardBusyAwayRadio = element(by.cssContainingText("span","Forward calls when line is busy or away"));
  this.forwardAll = element(by.id('cfa'));
  this.forwardBusy = element(by.id('cfb'));
  this.forwardAway = element(by.id('cfna'));
  this.forwardExternalCalls = element(by.id('ckForwardExternalCalls'));
  this.forwardExternalBusy = element(by.id('cfbExternal'));
  this.forwardExternalAway = element(by.id('cfnaExternal'));

  this.voicemailSwitch = element(by.model('voicemailEnabled')).element(by.css('input'));
  this.voicemailStatus = element(by.id('voicemailStatus'));

  this.snrSwitch = element(by.model('telephonyInfo.snrInfo.singleNumberReachEnabled')).element(by.css('input'));
  this.snrNumber = element(by.id('number'));
  this.snrStatus = element(by.id('snrStatus'));

  this.threeDotButton = element.all(by.cssContainingText('.col-md-12', 'Services')).first().all(by.css('.icon-three-dots')).first();
  this.addNewLine = element(by.cssContainingText('a', 'Add a New Line'));
  this.internalNumber = element(by.id('internalNumber'));
  this.externalNumber = element(by.id('externalNumber'));

  this.callerIdDefault = element(by.id('callerIdDefault'));
  this.callerIdCustom = element(by.id('callerIdOther'));
  this.callerId = element(by.id('other'));

  this.voicemail = element(by.id('voicemailStatus'));

  this.verifyNewNumber = function(){
    expect(this.internalNumber.isDisplayed()).toBeTruthy();
    var dNumbers = this.directoryNumbers;
    return this.internalNumber.element(by.css('option:checked')).getText().then(function(lineNumber){
      var returnVar = lineNumber;
      return dNumbers.each(function(directoryNumber){
        directoryNumber.getText().then(function(text){
          if(text.indexOf(lineNumber) !== -1 && text !== lineNumber){
            returnVar = null;
          }
        });
      }).then(function(){
        return returnVar;
      });
    });
  };

  this.verifyExistingNumber = function(){
    expect(this.internalNumber.isDisplayed()).toBeTruthy();
    var dNumbers = this.directoryNumbers;
    return this.internalNumber.element(by.css('option:checked')).getText().then(function(lineNumber){
      var returnVar = null;
      return dNumbers.each(function(directoryNumber){
        directoryNumber.getText().then(function(text){
          if((text.indexOf(lineNumber) !== -1) || (text === lineNumber)){
            returnVar = lineNumber;
          }
        });
      }).then(function(){
        return returnVar;
      });
    });
  };

  this.selectOption = function(dropdown, option){
    dropdown.element(by.css('.input-group-btn')).click();
    dropdown.element(by.cssContainingText('a', option)).click();
  };

  this.setNumber = function(dropdown, number){
    var input = dropdown.element(by.css('input'));
    input.click();
    input.sendKeys(number);
  };
}

module.exports = TelephonyPage;