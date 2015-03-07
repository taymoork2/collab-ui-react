'use strict'

var ManagePage = function () {
  this.displayName = element(by.id('displayName'));
  this.estimatedSize = element(by.id('estimatedSize'));
  this.totalUsers = element(by.id('totalUsers'));
  this.enableSSO = element(by.id('sso'));
  this.saveButton = element(by.id('btn-save'));
  this.refreshButton = element(by.id('btnReset'));

}

module.exports = ManagePage;
