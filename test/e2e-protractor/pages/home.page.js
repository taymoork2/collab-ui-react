'use strict'

var HomePage = function(){
  this.activeUsers = element(by.id('au-content'));
  this.calls = element(by.id('calls-content'));
  this.conversations = element(by.id('convo-content'));
  this.contentShare = element(by.id('share-content'));
  this.activeUsersChart = element(by.id('activeUsersChart'));

  this.refreshButton = element(by.id('time-click-div'));
  this.reloadedTime = element(by.id('lastReloadedTime'));
  this.refreshData = element(by.id('homeRefreshData'));

  this.homeSetup = element(by.css('.home-setup-panel'));
  this.quickSetupButton = element(by.id('btnQuickSetup'));
  this.quickSetupNextButton = element(by.buttonText('Next'));
  this.advancedSetupButton = element(by.id('btnAdvSetup'));
  this.enableServiceEntitlement = element(by.id('chk_invite'));
}

module.exports = HomePage;