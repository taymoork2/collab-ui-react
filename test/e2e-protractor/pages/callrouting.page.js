'use strict'

var CallRoutingPage = function(){
  this.addCallParkButton = element(by.css('button[ng-click="addCallPark()"]'));

  this.name = element(by.id('name'));
  this.singleNumber = element(by.cssContainingText('.radio-inline', 'Single Number'));
  this.rangeMin = element(by.id('rangeMin'));
  this.rangeMax = element(by.id('rangeMax'));
  this.pattern = element(by.id('pattern'));
  this.retrievalPrefix = element(by.id('retrievalPrefix'));
  this.reversionPattern = element(by.id('reversionPattern'));
  this.callParks = element.all(by.repeater('callPark in callParks'));

  this.createButton = element(by.buttonText('Create Call Park'));
  this.cancelButton = element(by.buttonText('Cancel'));
}

module.exports = CallRoutingPage;
