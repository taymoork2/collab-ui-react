'use strict'

var CallRoutingPage = function(){
  this.callParkSelect = element(by.css('.callrouting-nav')).element(by.cssContainingText('a', 'Call Park'));

  this.addCallParkButton = element(by.css('button[ng-click="addCallPark()"]'));
  this.callParkInfo = element(by.css('.new-button')).element(by.css('i'));
  this.callParkInfoTextOne = element(by.css('.callrouting-main-information')).element(by.cssContainingText('p', 'The Call Park feature'));
  this.callParkInfoTextTwo = element(by.css('.callrouting-main-information')).element(by.cssContainingText('p', 'You can define'));

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

  this.deleteCallPark = function(pattern) {
    this.callParks.filter(function(elem){
      return elem.evaluate('callPark.pattern').then(function(value) {
        return value === pattern;
      });
    }).first().element(by.css('.delete-icon')).click();
    browser.sleep(1000);
    expect(element(by.buttonText('Delete')).isDisplayed()).toBeTruthy;
    element(by.buttonText('Delete')).click();
    notifications.assertSuccess('deleted successfully');
    browser.sleep(1000);
  };
}

module.exports = CallRoutingPage;
