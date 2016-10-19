'use strict';

var componentPage = function () {
  this.addComponentBtn = element(by.css('.add-resource-button'));
  this.addComponent = element(by.css('.addComponent'));
  this.closeAddComponent = element(by.css('.close'));
  this.componentName = element(by.model('addComponent.componentName'));
  this.componentDesc = element(by.model('addComponent.componentDesc'));
  this.createComponentBtn = element(by.css('.activate-button'));
  this.updateComponent = element(by.id('updateButton2'));
  this.upCompName = element(by.model('updateCtrl.componentName'));
  this.updateComponentBtn = element(by.css('.activate-button'));
  this.deleteComponent = element.all(by.cssContainingText('.componentPage .status-components-list ul li', 'helloWorld')).first().element(by.id('deleteButton2'));
  this.DELETEInput = element(by.css('.deleteIncidentPage input'));
  this.deleteComponentBtn = element(by.css('.deleteIncidentPage button'));
};
module.exports = componentPage;
