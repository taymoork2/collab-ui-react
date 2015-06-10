'use strict';

var RolesPage = function () {
  var randomId = utils.randomId();

  this.rolesDetailsPanel = element(by.id('rolesDetailsPanel'));
  this.lastNameInput = element(by.id('lastNameInput'));
  this.displayNameInput = element(by.id('displayNameInput'));
  this.emailInput = element(by.id('customerEmailInput'));
  this.fullAdmin = element(by.id('full-admin-options')).element(by.css('.ng-valid'));
  this.saveButton = element(by.css('.ent-detail-panel')).element(by.id('btn-save'));
  this.noAdmin = element(by.id('no-admin-options')).element(by.css('.ng-valid'));
  this.closeButton = element(by.css('.close-row'));
  this.sipAddressesInput = element(by.id('sipAddressesInput'));

  this.editLastName = function () {
    utils.expectIsDisplayed(this.lastNameInput);
    this.lastNameInput.clear();
    this.lastNameInput.sendKeys(randomId);
  };

  this.editDisplayName = function () {
    utils.expectIsDisplayed(this.displayNameInput);
    utils.clear(this.displayNameInput);
    utils.sendKeys(this.displayNameInput, randomId);
  };

  this.getCreatedUser = function () {
    return randomId;
  };

};

module.exports = RolesPage;
