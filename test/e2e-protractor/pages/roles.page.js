'use strict';

var RolesPage = function () {
  this.rolesDetailsPanel = element(by.id('rolesDetailsPanel'));
  this.firstNameInput = element(by.id('firstNameInput'));
  this.lastNameInput = element(by.id('lastNameInput'));
  this.displayNameInput = element(by.id('displayNameInput'));
  this.emailInput = element(by.id('customerEmailInput'));

  this.fullAdmin = element(by.id('full-admin-options')).element(by.css('div.cs-input-radio'));
  this.salesAdmin = element(by.css('label[for="salesAdminCkbx"]'));
  this.noAdmin = element(by.id('no-admin-options')).element(by.css('div.cs-input-radio'));

  this.saveButton = element(by.id('saveButton'));
  this.closeButton = element(by.css('.close-row'));

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
};

module.exports = RolesPage;
