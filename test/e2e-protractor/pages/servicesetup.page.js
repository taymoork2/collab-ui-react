'use strict';

var ServiceSetup = function () {
  this.timeZone = element(by.id('timeZone'));
  this.steeringDigit = element(by.id('steeringDigit'));
  this.globalMOH = element(by.id('globalMOH'));
  this.addNumberRange = element(by.linkText('Add More Extension Ranges'));
  this.numberRanges = element.all(by.repeater('internalNumberRange in internalNumberRanges'));
  this.save = element(by.buttonText('Save'));

  this.deleteNumberRange = function(testBeginNumber) {
    this.numberRanges.filter(function(elem){
      return elem.element(by.model('internalNumberRange.beginNumber')).getAttribute('value').then(function(value){
        return value === testBeginNumber;
      });
    }).then(function(filteredElements){
      filteredElements[0].element(by.linkText('Delete')).click();
    });
  };
};

module.exports = ServiceSetup;
