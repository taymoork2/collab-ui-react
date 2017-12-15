'use strict';

var GSSComponentPage = function () {
  this.newComponentName = 'e2e-gss-component';
  this.newGroupName = 'e2e-gss-group';
  this.updatedGroupName = 'e2e-gss-group-updated';
  this.componentMain = element(by.css('.component-page'));
  this.serviceSelector = element(by.css('#serviceSelector'));
  this.tabLink = element(by.css('a[href="/gss/components"]'));
  this.serviceSelectorFirstChild = element(by.css('.gss-iframe .select-options li a'));
  this.addComponentBtn = element(by.cssContainingText('button', 'Add A Component'));
  this.addComponent = element(by.css('.add-component'));
  this.addComponentGroupSelect = element(by.css('.add-component-page .dropdown a.select-toggle'));
  this.componentName = element(by.model('addComponentCtrl.componentName'));
  this.componentDesc = element(by.model('addComponentCtrl.componentDesc'));
  this.createNewGroupOption = element(by.cssContainingText('.dropdown-menu .select-options li a', 'Create new component group'));
  this.newGroupNameInput = element(by.model('addComponentCtrl.groupName'));
  this.createComponentBtn = element(by.css('.add-component-page .btn--primary'));
  this.updateComponentModal = element(by.css('.update-component'));
  this.updateComponent = element.all(by.cssContainingText('.component-page .gss-components-list li', this.newGroupName)).first().element(by.cssContainingText('a', 'Edit'));
  this.upCompName = element(by.model('updateComponentCtrl.componentName'));
  this.updateComponentBtn = element(by.cssContainingText('button', 'Update Component'));
  this.deleteComponent = element.all(by.cssContainingText('.component-page .gss-components-list li', this.updatedGroupName)).first().element(by.cssContainingText('a', 'Delete'));
  this.deleteInput = element(by.css('.delete-component-page input'));
  this.deleteComponentBtn = element(by.css('.delete-component-page button.btn--negative'));

  this.clickComponent = function () {
    navigation.clickGSSTab();
    utils.click(this.tabLink);
    navigation.expectCurrentUrl('/gss/component');
  }
};
module.exports = GSSComponentPage;
