'use strict';

var RolesPage = function () {
  this.rolesDetailsPanel = element(by.id('rolesDetailsPanel'));
  this.firstNameInput = element(by.id('firstNameInput'));
  this.lastNameInput = element(by.id('lastNameInput'));
  this.displayNameInput = element(by.id('displayNameInput'));
  this.emailInput = element(by.id('customerEmailInput'));

  this.fullAdmin = element(by.id('full-admin-options')).element(by.css('.ng-valid'));
  this.salesAdmin = element(by.id('sales-admin-options')).element(by.css('.ng-valid'));
  this.noAdmin = element(by.id('no-admin-options')).element(by.css('.ng-valid'));

  this.adminRadio = element(by.model('rolesObj.adminRadioValue'));

  this.saveButton = element(by.css('.ent-detail-panel')).element(by.id('btn-save'));
  this.closeButton = element(by.css('.close-row'));
  this.sipAddressesInput = element(by.id('sipAddressesInput'));

  this.setFirstName = function (newFirstName) {
    utils.expectIsDisplayed(this.firstNameInput);
    this.firstNameInput.clear();
    this.firstNameInput.sendKeys(newFirstName);
  };

  this.setLastName = function (newLastName) {
    utils.expectIsDisplayed(this.lastNameInput);
    this.lastNameInput.clear();
    this.lastNameInput.sendKeys(newLastName);
  };

  this.setDisplayName = function (newDisplayName) {
    utils.expectIsDisplayed(this.displayNameInput);
    this.displayNameInput.clear();
    this.displayNameInput.sendKeys(newDisplayName);
  };

  this.getFirstName = function () {
    return this.firstNameInput.getAttribute('value');
  };

  this.getLastName = function () {
    return this.lastNameInput.getAttribute('value');
  };

  this.getDisplayName = function () {
    return this.displayNameInput.getAttribute('value');
  };

  this.getEmail = function () {
    return this.emailInput.getAttribute('value');
  };

  this.noAdminValue = function () {
    return this.noAdmin.getAttribute('value');
  };

  this.salesAdminValue = function () {
    return this.salesAdmin.getAttribute('value');
  };

  this.fullAdminValue = function () {
    return this.fullAdmin.getAttribute('value');
  };

  this.getAdminRadioValue = function () {
    return this.adminRadio.getAttribute('value');
  };
};

module.exports = RolesPage;
