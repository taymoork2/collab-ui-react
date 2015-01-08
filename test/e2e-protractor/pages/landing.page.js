'use strict';
/* global element */
/* global by, $ */

var LandingPage = function() {
  this.packages = element(by.css('.packages'));
  this.packagesName = element(by.css('.packages-name'));
  this.packagesDaysLeft = element(by.css('.packages-days-left'));
  this.packagesUnlimited = element(by.css('.packages-unlimited'));

  this.devices = element(by.css('.devices'));

  this.licenses = element(by.css('.licenses'));
  this.licensesBought = element(by.css('.licenses-bought'));
  this.licensesLeft = element(by.css('.licenses-left'));
  this.licensesUsed = element(by.css('.licenses-used'));

  this.unlicencedUsers = element(by.css('.unlicensed-users'));
  this.callsChart = element(by.id('callsChart'));

  this.monitoring = element(by.css('.monitoring-panel'));

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

  this.convertButton = element(by.id('convertButton'));
  this.convertDialog = element(by.id('convertDialog'));
  this.convertModalClose = element(by.id('convertModalClose'));
  this.convertCancelButton = element(by.id('convertModalClose'));
  this.convertActionButton = element(by.id('convertActionButton'));
};

module.exports = LandingPage;
