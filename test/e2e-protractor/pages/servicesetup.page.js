'use strict';

var ServiceSetup = function () {
  this.timeZone = element(by.css('.select-list[name="timeZone"] a.select-toggle'));
  this.preferredLanguage = element(by.css('.select-list[name="preferredLanguage"] a.select-toggle'));
  this.steeringDigit = element(by.css('.select-list[name="steeringDigit"] a.select-toggle'));
  this.siteSteeringDigit = element(by.css('.select-list[name="siteSteeringDigit"] a.select-toggle'));
  this.siteCode = element(by.id('siteCode'));
  this.globalMOH = element(by.css('.select-list[name="globalMOH"] a.select-toggle'));
  this.siteCode = element(by.id('siteCode'));
  this.companyVoicemail = element(by.id('companyVoicemail'));
  this.addNumberRange = element(by.buttonText('Add more extension ranges'));
  this.numberRanges = element.all(by.repeater('element in model[options.key]'));
  this.save = element(by.buttonText('Save'));

  this.newRange = this.numberRanges.last();
  this.newBeginRange = this.newRange.element(by.id('beginNumber'));
  this.newEndRange = this.newRange.element(by.id('endNumber'));

  this.getPattern = function () {
    return (Math.floor(Math.random() * 997) + 1000).toString(); // Max of 1997
  };

  this.deleteNumberRange = function (testBeginNumber) {
    utils.click(this.numberRanges.filter(function (numberRange) {
      return numberRange.element(by.id('beginNumber')).getAttribute('value').then(function (value) {
        return value === testBeginNumber;
      });
    }).first().element(by.buttonText('Delete')));
  };
};

module.exports = ServiceSetup;
