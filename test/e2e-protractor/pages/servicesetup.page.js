'use strict';

var ServiceSetup = function () {
  this.timeZone = element(by.id('timeZone'));
  this.steeringDigit = element(by.id('steeringDigit'));
  this.siteSteeringDigit = element(by.id('siteSteeringDigit'));
  this.siteCode = element(by.id('siteCode'));
  this.siteCode = element(by.id('siteCode'));
  this.companyVoicemail = element(by.id('companyVoicemail'));
  this.addNumberRange = element(by.linkText('Add More Extension Ranges'));
  this.numberRanges = element.all(by.repeater('internalNumberRange in serviceSetup.internalNumberRanges'));
  this.save = element(by.buttonText('Save'));

  this.newRange = this.numberRanges.last();
  this.newBeginRange = this.newRange.element(by.model('internalNumberRange.beginNumber'));
  this.newEndRange = this.newRange.element(by.model('internalNumberRange.endNumber'));

  this.getPattern = function () {
    return (Math.floor(Math.random() * 9000) + 1000).toString(); // 4 digits
  };

  this.deleteNumberRange = function (testBeginNumber) {
    utils.click(this.numberRanges.filter(function (elem) {
      return elem.evaluate('internalNumberRange.beginNumber').then(function (value) {
        return value === testBeginNumber;
      });
    }).first().element(by.linkText('Delete')));
  };
};

module.exports = ServiceSetup;
