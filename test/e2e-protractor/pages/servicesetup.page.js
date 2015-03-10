'use strict';

var ServiceSetup = function () {
  this.timeZone = element(by.id('timeZone'));
  this.steeringDigit = element(by.id('steeringDigit'));
  this.globalMOH = element(by.id('globalMOH'));
  this.addNumberRange = element(by.linkText('Add More Extension Ranges'));
  this.numberRanges = element.all(by.repeater('internalNumberRange in internalNumberRanges'));
  this.save = element(by.buttonText('Save'));

  this.deleteNumberRange = function (testBeginNumber) {
    utils.click(this.numberRanges.filter(function (elem) {
      return elem.evaluate('internalNumberRange.beginNumber').then(function (value) {
        return value === testBeginNumber;
      });
    }).first().element(by.linkText('Delete')));
  };
};

module.exports = ServiceSetup;
