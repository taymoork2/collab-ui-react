'use strict';

var CallRoutingPage = function () {
  this.callParkSelect = element(by.css('.callrouting-nav')).element(by.cssContainingText('a', 'Call Park'));

  this.addCallParkButton = element(by.buttonText('New Call Park'));
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
  this.callParks = element.all(by.repeater('callPark in cp.callParks'));
  this.createButton = element(by.buttonText('Create Call Park'));
  this.deleteButton = element(by.buttonText('Delete'));
  this.cancelButton = element(by.buttonText('Cancel'));
  this.callParkCount = element(by.cssContainingText('.callrouting-nav-menuitem', 'Park')).element(by.css('.count'));

  this.getPattern = function () {
    return Math.ceil(Math.random() * Math.pow(10, 4)).toString();
  };

  this.clickDeleteIcon = function (pattern) {
    utils.click(this.callParks.filter(function (elem) {
      return elem.evaluate('callPark.pattern').then(function (value) {
        return value === pattern;
      });
    }).first().element(by.css('.delete-icon')));
  };
};

module.exports = CallRoutingPage;
