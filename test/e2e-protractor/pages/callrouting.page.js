'use strict'

var CallRoutingPage = function(){
  this.addCallParkButton = element(by.css('button[ng-click="addCallPark()"]'));

  this.name = element(by.id('name'));
  this.singleNumber = element(by.css("input[ng-model='options.pattern'][value='single']"));
  this.pattern = element(by.id('pattern'));
  this.retrievalPrefix = element(by.id('retrievalPrefix'));
  this.reversionPatternRadio = element(by.css("input[ng-model='options.reversionPattern'][value='custom']"));
  this.reversionPattern = element(by.id('reversionPattern'));
  this.callParks = element.all(by.repeater('callPark in callParks'));

  this.createButton = element(by.buttonText('Create Call Park'));
  this.cancelButton = element(by.buttonText('Cancel'));

  this.deleteCallPark = function(callPark) {
    this.callParks.each(function(elem){
          elem.getText().then(function(text){
            if (text.indexOf(callPark) !== -1) {
              elem.element(by.tagName('button')).click();
            }
          });
      });
  }
}

module.exports = CallRoutingPage;

