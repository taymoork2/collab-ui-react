'use strict';

var LandingPage = function () {
  this.nontrialadmin = {
    username: 'pbr-test-admin@squared2webex.com',
    password: 'C1sc0123!',
  };

  this.trialadmin = {
    username: 'atlasmapservice+ll1@gmail.com',
    password: 'C1sc0123!',
  };

  this.nonadmin = {
    username: 'pbr-invite-user@squared2webex.com',
    password: 'C1sc0123!',
  };

  this.packages = element(by.css('.packages'));
  this.packagesName = element(by.css('.packages-name'));
  this.packagesDaysLeft = element(by.css('.packages-days-left'));
  this.packagesUnlimited = element(by.css('.packages-unlimited'));

  this.devices = element(by.css('.devices'));

  this.licenses = element(by.css('.licenses'));
  this.licensesBought = element(by.css('.licenses-bought'));
  this.licensesLeft = element(by.css('.licenses-left'));
  this.licensesUsed = element(by.css('.licenses-used'));

  this.unlicensedUsers = element(by.css('.unlicensed-users'));
  this.callsChart = element(by.id('callsChart'));

  this.monitoringRows = element(by.css('.monitoring-panel ul li a'));

  this.refreshButton = element(by.id('time-click-div'));
  this.reloadedTime = element(by.id('lastReloadedTime'));
  this.refreshData = element(by.id('homeRefreshData'));

  this.homeSetup = element(by.css('.home-setup-panel'));
  this.quickSetupButton = element(by.id('btnQuickSetup'));
  this.quickSetupNextButton = element(by.buttonText('Next'));
  this.advancedSetupButton = element(by.id('btnAdvSetup'));
  this.enableServiceEntitlement = element(by.id('chk_invite'));

  this.addUserQuickLink = element(by.id('addUserQuickLink'));
  this.installDeviceQuickLink = element(by.id('installDeviceQuickLink'));
  this.installDeviceSharedSpaceQuickLink = element(by.id('installDeviceSharedSpaceQuickLink'));
  this.autoAttendantQuickLink = element(by.id('autoAttendantQuickLink'));
  this.deviceLogsQuickLink = element(by.id('deviceLogsQuickLink'));

  this.convertButton = element(by.css('#convertButton:not(:disabled)'));
  this.convertDialog = element(by.id('convertDialog'));
  this.convertModalClose = element(by.id('convertModalClose'));
  this.convertNextButton = element(by.id('convertNextButton'));
  this.btnConvert = element(by.id('btnConvert'));
  this.btnBack = element(by.id('btnBack'));
  this.closeAddUser = element(by.id('closeAddUser'));
  this.closeConvertUser = element(by.id('closeConvertUser'));
  this.unlicensedUserRow = element(by.css('.ui-grid-selection-row-header-buttons'));
  this.userBtn = element(by.css('.btn--user '));
  this.serviceSetup = element(by.css('.settings-menu'));

  function convertUsersSearch(query) {
    return element.all(by.cssContainingText('.ui-grid .ui-grid-row .ui-grid-cell-contents', query)).first();
  }
};

module.exports = LandingPage;
