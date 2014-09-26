'use strict'

var CallRoutingPage = function(){
  this.addCallParkButton = element(by.css('button[ng-click="addCallPark()"]'));

  this.name = element(by.id('name'));
  this.singleNumber = element(by.css("input[ng-model='options.pattern'][value='single']"));
  this.pattern = element(by.id('pattern'));
  this.retrievalPrefix = element(by.id('retrievalPrefix'));
  this.reversionPatternRadio = element(by.css("input[ng-model='options.reversionPattern'][value='custom']"));
  this.reversionPattern = element(by.id('reversionPattern'));

  this.createButton = element(by.buttonText('Create Call Park'));
  this.cancelButton = element(by.buttonText('Cancel'));
}

module.exports = CallRoutingPage;

