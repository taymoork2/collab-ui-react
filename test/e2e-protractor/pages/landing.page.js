'use strict'

var LandingPage = function() {
  this.packages = element(by.css('.packages'));
  this.devices = element(by.css('.devices'));
  this.licenses = element(by.css('.licenses'));
  this.unlicencedUsers = element(by.css('.unlicensed-users-unclaimeddomain'));
  this.activeUsersChart = element(by.id('activeUsersChart'));

  this.monitoring = element(by.css('.monitoring-panel'));

  this.refreshButton = element(by.id('time-click-div'));
  this.reloadedTime = element(by.id('lastReloadedTime'));
  this.refreshData = element(by.id('homeRefreshData'));

  this.homeSetup = element(by.css('.home-setup-panel'));
  this.quickSetupButton = element(by.id('btnQuickSetup'));
  this.quickSetupNextButton = element(by.buttonText('Next'));
  this.advancedSetupButton = element(by.id('btnAdvSetup'));
  this.enableServiceEntitlement = element(by.id('chk_invite'));
}

module.exports = LandingPage;
