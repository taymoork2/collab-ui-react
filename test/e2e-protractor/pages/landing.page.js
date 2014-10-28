'use strict';
/* global element */
/* global by */

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

  this.quickLinks = element.all(by.repeater('item in links'));

  this.getQuickLinks = function() {
    return this.quickLinks.then(function(links){
      return links.length;
    });
  };
};

module.exports = LandingPage;
