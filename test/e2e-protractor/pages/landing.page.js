'use strict';
/* global element */
/* global by */

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

  this.monitoringRows = element.all(by.repeater('health in healthMetrics')).all(by.tagName('a'));

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
  this.convertCancelButton = element(by.id('convertModalClose'));
  this.convertActionButton = element(by.id('convertActionButton'));
  this.unlicensedUserRow = element(by.css('.ngRow'));
};

module.exports = LandingPage;
